const path = require('path');
const express = require('express');
// const http = require('http');
const puppeteer = require("puppeteer");
// const handlebars = require("handlebars");
const fs = require("fs");


const PORT = process.env.PORT || 5000

const app = express();

app.listen(PORT, () => {
  console.log('live on PORT ' + PORT);
});



app.get('/', function (req, res) {
  console.log('route')
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello');
});


app.get('/pdf', async (req, res) => {
  const pdf = await getPdf();

  console.log('route /test');
  res.statusCode = 200;

  res.writeHead(200, {
    "Content-Type": "application/octet-stream",
    "Content-Disposition": "attachment; filename=invoice.pdf"
  });
  fs.createReadStream('invoice.pdf').pipe(res);


});


const html_to_pdf = async ({ templateHtml, dataBinding, options }) => {
  // const template = handlebars.compile(templateHtml);
  const finalHtml = encodeURIComponent(templateHtml);

  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
    headless: true
  });
  const page = await browser.newPage();
  await page.goto(`data:text/html;charset=UTF-8,${finalHtml}`, {
    waitUntil: "networkidle0",
  });

  await page.addStyleTag({
    content:
      `
        @font-face {
           font-family: myFirstFont;
           src: url("data:font/ttf;base64,${fs.readFileSync('./fonts/EduVICWANTBeginner-VariableFont_wght.ttf').toString('base64')}")
        }
        div {
           font-family: myFirstFont;
           font-size: 22px;
        }
        `
  });

  // await page.evaluateHandle('document.fonts.ready');
  const pdf = await page.pdf(options);
  await browser.close();
  return pdf
};



const getPdf = async () => {
  const dataBinding = {
    // items: [
    //   {
    //     name: "item 1",
    //     price: 100,
    //   },
    //   {
    //     name: "item 2",
    //     price: 200,
    //   },
    //   {
    //     name: "item 3",
    //     price: 300,
    //   },
    // ],
    total: 600,
    isWatermark: true,
  };

  const templateHtml = fs.readFileSync(
    path.join(process.cwd(), "invoice.html"),
    "utf8"
  );

  const options = {
    format: "A4",
    headerTemplate: "<p></p>",
    footerTemplate: "<p></p>",
    displayHeaderFooter: false,
    margin: {
      top: "40px",
      bottom: "100px",
    },
    printBackground: true,
    path: "invoice.pdf",
  };

  const pdf = await html_to_pdf({ templateHtml, dataBinding, options });

  return pdf;
}
