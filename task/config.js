const AWS = require('aws-sdk');
const { CognitoIdentityServiceProvider } = AWS;
class Config {
  setup(options) {
    const provider = new CognitoIdentityServiceProvider(options);
    return provider.getUser({})
    .promise()
    .then(data => {
      this.data = data;
      this.env = {
        access: process.env.ACCESS || require('./env').ACCESS,
        secret: process.env.SECRET || require('./env').SECRET,
      };
    })
    .catch(e => this.env = { security: e.message });
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
