const awsServerlessExpress = require('aws-serverless-express');
const app = require('./app');

const logger = console;
const server = awsServerlessExpress.createServer(app);

exports.handler = (event, context) => {
  global.Self = {
    event,
  };
  logger.log(`EVENT: ${JSON.stringify(event)}`);
  awsServerlessExpress.proxy(server, event, context);
};
