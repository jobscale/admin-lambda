const awsServerlessExpress = require('aws-serverless-express');
const app = require('./app');
global.logger = console;
const server = awsServerlessExpress.createServer(app);
exports.handler = (event, context) => {
  logger.log(`EVENT: ${JSON.stringify(event)}`);
  awsServerlessExpress.proxy(server, event, context);
};
