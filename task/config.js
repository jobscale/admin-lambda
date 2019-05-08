const AWS = require('aws-sdk');
class Config {
  async setup(options) {
    const { Guest } = require('./guest');
    const { CognitoIdentityServiceProvider } = AWS;
    return new Guest().signIn(this.authData)
    .then(accessToken => {
      options.params.AccessToken = accessToken;
    })
    .catch(e => logger.error(e.message))
    .then(() => {
      const provider = new CognitoIdentityServiceProvider(options);
      return provider.getUser({}).promise();
    })
    .then(data => {
      this.data = data;
      const access = process.env.ACCESS || require('./env').ACCESS;
      const secret = process.env.SECRET || require('./env').SECRET;
      this.env = { access, secret };
    })
    .catch(e => {
      this.env = { security: e.message };
      logger.error({ Error: this.env });
    });
  }
  get access() {
    return this.env.access;
  }
  get secret() {
    return this.env.secret;
  }
}
module.exports = {
  Config,
};
