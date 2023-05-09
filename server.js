const fs = require('fs');
const https = require('https');

https
  .createServer(
    {
      cert: fs.readFileSync('localhost.crt'),
      key: fs.readFileSync('localhost.key'),
      requestCert: true,
      rejectUnauthorized: false,
      ca: fs.readFileSync('myCA.crt'),
    },
    (req, res) => {
        if (!req.client.authorized) {
            res.writeHead(401);
            return res.end('Invalid client certificate authentication.');
          }

          res.writeHead(200);
          res.end('Hello, world!');
        }
  )
  .listen(9443);
