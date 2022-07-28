const express = require('express');
const puppeteer = require("puppeteer");
// const fs = require("fs");
const { Readable } = require('stream');
const { convertToPdf } = require("./htmlToPdf.js");

const PORT = process.env.PORT || 5000

const app = express();

app.listen(PORT, () => {
  console.log('live on PORT ' + PORT);
});

app.use(require('body-parser').json());
app.all('/', async (req, res) => {
  const pdf = await convertToPdf(req.body);
  res.statusCode = 200;
  res.writeHead(200, {
    "Content-Type": "application/octet-stream",
    "Content-Disposition": "attachment; filename=invoice.pdf"
  });
  const stream = Readable.from(pdf);
  stream.pipe(res);

});
