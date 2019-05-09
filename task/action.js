const { User } = require('./user');

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
      attribute.count--;
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
  }
}
module.exports = {
  Action,
};
