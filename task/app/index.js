const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const { Action } = require('./action');

const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  res.header('Access-Control-Expose-Headers', 'Content-Length');
  res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range');
  if (req.method === 'OPTIONS') {
    res.send(200);
    return;
  }
  next();
});

app.post('/fetch', (req, res) => {
  switch (req.body.action) {
  case 'download':
    new Action().getClient(req, res);
    break;
  case 'getCount':
    new Action().getCount(req, res);
    break;
  case 'downCount':
    new Action().downCount(req, res);
    break;
  default:
    res.json({ message: 'succeeded.' });
    break;
  }
});

app.post('/fetch/*', (req, res) => {
  res.json({ success: 'post call succeed!', url: req.url, body: req.body });
});

app.listen(3000, () => {
  logger.log('App started');
});

module.exports = app;
