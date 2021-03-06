const { User } = require('./user');
const { Service } = require('./service');

class Action {
  fromNameValue(list) {
    const result = {};
    list.forEach(item => {
      result[item.Name] = item.Value;
    });
    return result;
  }
  toNameValue(items) {
    return Object.keys(items).map(key => ({
      Name: key,
      Value: items[key],
    }));
  }
  getCount(req, res) {
    const { event } = req.apiGateway;
    event.body = req.body;
    const user = new User(event);
    user.setup()
    .then(() => user.getUser())
    .then(user => res.json(user));
  }
  downCount(req, res) {
    const { event } = req.apiGateway;
    event.body = req.body;
    const user = new User(event);
    const update = {};
    user.setup()
    .then(() => user.getUser())
    .then(data => update.data = data)
    .then(() => {
      const attribute = JSON.parse(
        this.fromNameValue(update.data.UserAttributes)['custom:attribute'],
      );
      if (!attribute.count) throw new Error('data invalid failed.');
      attribute.count--;
      if (!attribute.count) throw new Error('data available zero.');
      update.data.UserAttributes = this.toNameValue({
        'custom:attribute': JSON.stringify(attribute),
      });
      return update.data;
    })
    .catch(e => {
      logger.error({ Error: e.message });
      update.data.UserAttributes = this.toNameValue({
        'custom:attribute': JSON.stringify({
          count: 10,
        }),
      });
      return update.data;
    })
    .then(data => user.adminUpdateUserAttributes(data))
    .then(data => {
      res.json(data);
    })
    .catch(e => {
      logger.error(JSON.stringify(
        { message: e.message, stack: e.stack }, null, 2,
      ));
      res.json({
        error: e.message, url: req.url,
      });
    });
  }
  getClient(req, res) {
    const { event } = req.apiGateway;
    event.body = req.body;
    const user = new User(event);
    const update = {};
    user.setup()
    .then(() => user.getUser())
    .then(data => update.data = data)
    .then(() => {
      const attribute = JSON.parse(
        this.fromNameValue(update.data.UserAttributes)['custom:attribute'],
      );
      if (!attribute.count) throw new Error('data invalid failed.');
    })
    .then(() => new Service().generateClientSSL())
    .then(data => logger.info(data.stdout.toString()))
    .then(() => new Service().getFile('/tmp/sslGen/client.crt'))
    .then(data => {
      res.json({ data: data.stdout });
    })
    .catch(e => {
      logger.error(JSON.stringify(
        { message: e.message, stack: e.stack }, null, 2,
      ));
      res.json({
        error: e.message, url: req.url,
      });
    });
  }
}
module.exports = {
  Action,
};
