const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const { Action } = require('./action');

const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.post('/fetch', (req, res) => {
  new Action().getClient(req, res);
});

app.post('/fetch/*', (req, res) => {
  res.json({ success: 'post call succeed!', url: req.url, body: req.body });
});

app.listen(3000, () => {
  logger.log('App started');
});

module.exports = app;
