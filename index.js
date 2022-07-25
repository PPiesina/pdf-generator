const path = require('path')
const PORT = process.env.PORT || 5000


const http = require('http');

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello');
});

server.listen(PORT, () => console.log(`Listening on ${PORT}`))