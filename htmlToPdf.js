const path = require('path');
const handlebars = require("handlebars");

const options = {
  format: "A4",
  printBackground: true
};

module.exports.convertToPdf = async ({ html, templateVariables, selector }, browser) => {

  const template = handlebars.compile(html);
  const finalHtml = encodeURIComponent(template(templateVariables));

  const page = await browser.newPage();
  page.goto(`data:text/html;charset=UTF-8,${finalHtml}`);
  await page.waitForSelector(selector || 'html');

  const pdf = await page.pdf(options);
  await page.close();
  return pdf
};