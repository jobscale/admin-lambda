const AWS = require('aws-sdk');
class Config {
  async check(options) {
    if (options.params.AccessToken) throw new Error('taken exist warning.');
  }
  async setup(options) {
    const { Guest } = require('./guest');
    const { CognitoIdentityServiceProvider } = AWS;
    return this.check(options)
    .then(() => new Guest().signIn(this.authData))
    .then(accessToken => {
      logger.info({ accessToken });
      options.params.AccessToken = accessToken;
    })
    .catch(e => {
      logger.error(e.message);
      if (!options.params.AccessToken) throw e;
    })
    .then(() => {
      const provider = new CognitoIdentityServiceProvider(options);
      return provider.getUser({}).promise();
    })
    .then(data => {
      this.authUser = data;
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
