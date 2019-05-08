const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const { User } = require('./user');

const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

const util = {
  fromNameValue: list => {
    const result = {};
    list.forEach(item => {
      result[item.Name] = item.Value;
    });
    return result;
  },
  toNameValue: items => {
    return Object.keys(items).map(key => ({
      Name: key,
      Value: items[key],
    }));
  },
};

app.post('/fetch', (req, res) => {
  const { event } = req.apiGateway;
  event.body = req.body;
  const user = new User(event);
  const update = {};
  user.setup()
  .then(() => user.getUser())
  .then(() => user.listUsers())
  .then(data => update.data = data)
  .then(() => {
    const attribute = JSON.parse(util.fromNameValue(update.data.Attributes)['custom:attribute']);
    if (!attribute.count) throw Error('data invalid');
    attribute.count--;
    update.data.Attributes = util.toNameValue({
      'custom:attribute': JSON.stringify(attribute),
    });
    return update.data;
  })
  .catch(e => {
    logger.error({ Error: e.message });
    update.data.Attributes = util.toNameValue({
      'custom:attribute': JSON.stringify({
        count: 10,
      }),
    });
    return update.data;
  })
  .then(data => user.adminUpdateUserAttributes(data))
  .then(() => {
    res.json({
      success: 'post call succeed!', url: req.url,
    });
  })
  .catch(e => {
    logger.error(JSON.stringify(
      { message: e.message, stack: e.stack }, null, 2,
    ));
    res.json({
      error: e.message, url: req.url,
    });
  });
});

app.post('/fetch/*', (req, res) => {
  res.json({ success: 'post call succeed!', url: req.url, body: req.body });
});

app.listen(3000, () => {
  logger.log('App started');
});

module.exports = app;
