const puppeteer = require("puppeteer");
const handlebars = require("handlebars");
const fs = require("fs");

module.exports.html_to_pdf = async ({ templateHtml, dataBinding, options }) => {
   const template = handlebars.compile(templateHtml);
   const finalHtml = encodeURIComponent(template(dataBinding));

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
  const pdf =  await page.pdf(options);
  await browser.close();
  return pdf
};