const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const { Readable } = require('stream');
const { convertToPdf } = require("./htmlToPdf.js");
const puppeteer = require("puppeteer");


const app = express();
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log('live on PORT ' + PORT);
});

app.use(helmet()); // adds protection headers
app.use(compression()); // Compress all routes


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

app.get('/', (req, res) => {
  res.send('Use post for pdf generator')
})


let browser;
(async () => {
  const minimal_args = [
    '--autoplay-policy=user-gesture-required',
    '--disable-background-networking',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-breakpad',
    '--disable-client-side-phishing-detection',
    '--disable-component-update',
    '--disable-default-apps',
    '--disable-dev-shm-usage',
    '--disable-domain-reliability',
    '--disable-extensions',
    '--disable-features=AudioServiceOutOfProcess',
    '--disable-hang-monitor',
    '--disable-ipc-flooding-protection',
    '--disable-notifications',
    '--disable-offer-store-unmasked-wallet-cards',
    '--disable-popup-blocking',
    '--disable-print-preview',
    '--disable-prompt-on-repost',
    '--disable-renderer-backgrounding',
    '--disable-setuid-sandbox',
    '--disable-speech-api',
    '--disable-sync',
    '--hide-scrollbars',
    '--ignore-gpu-blacklist',
    '--metrics-recording-only',
    '--mute-audio',
    '--no-default-browser-check',
    '--no-first-run',
    '--no-pings',
    '--no-sandbox',
    '--no-zygote',
    '--password-store=basic',
    '--use-gl=swiftshader',
    '--use-mock-keychain',
  ];


  
  browser = await puppeteer.launch({
    args :minimal_args,
    headless: true,
    userDataDir: './my/path'
  });
})();

function routerErrorCatcher(wrapped) {
  return async function () {
    try {
      return await wrapped.apply(this, arguments);
    } catch (error) {
      try {
        arguments[1].status(500).send({error: error.message})
      } catch (err) {
        console.log(err);
      }
    }
  }
}


app.post('/', routerErrorCatcher(postRouter));

async function postRouter(req, res) {
  const {isValid, incorrectFields} = validatePdfRequestBody(req.body);
  if(!isValid){
    throw new Error(`Error in request body. Incorect fields: ${incorrectFields}`);
  }

  const pdf = await convertToPdf(req.body, browser);

  res.statusCode = 200;

  res.writeHead(200, {
    "Content-Type": "application/octet-stream",
    "Content-Disposition": "attachment; filename=invoice.pdf"
  });
  const stream = Readable.from(pdf);
  stream.pipe(res);
}

validatePdfRequestBody = (body) => {
  const incorrectFields = [];
  if(!body.html || typeof body.html !== "string"){
    incorrectFields.push('html');
  }
  if(!body.templateVariables || typeof body.templateVariables !== "object"){
    incorrectFields.push('templateVariables');
  }
  if(body.selector && typeof body.selector !== "string"){
    incorrectFields.push('selector');
  }

  return {
    isValid: incorrectFields.length === 0,
    incorrectFields
  }
}

