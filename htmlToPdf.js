const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require('path');

module.exports.convertToPdf = async ({html}) => {
   const options = {
     format: "A4",
     printBackground: true
   };
 
   const pdf = await html_to_pdf({ html, options });
 
   return pdf;
 };

const html_to_pdf = async ({ html, options }) => {
   const finalHtml = encodeURIComponent(html);
 
   const browser = await puppeteer.launch({
     args: [
       '--no-sandbox',
       '--disable-setuid-sandbox'
     ],
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
         `
   });
   const pdf = await page.pdf(options);
   await browser.close();
   return pdf
 };