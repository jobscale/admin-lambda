const AWS = require('aws-sdk');
const { CognitoIdentityServiceProvider } = AWS;
const { Config } = require('./config');
class User {
  setup(event) {
    const { accessToken } = event.body;
    AWS.config.update({ region: 'us-east-2' });
    const params = { AccessToken: accessToken };
    return this.config({ params })
    .then(() => this.initialize(event));
  }
  config(options) {
    const config = new Config();
    return config.setup(options)
    .then(() => {
      options.accessKeyId = config.access;
      options.secretAccessKey = config.secret;
      logger.info(options);
      this.provider = new CognitoIdentityServiceProvider(options);
    });
  }
  initialize(event) {
    const { identity } = event.requestContext;
    const { cognitoAuthenticationProvider } = identity;
    const { cognitoIdentityPoolId, userArn } = identity;
    const parts = cognitoAuthenticationProvider.split(':');
    const userPoolIdParts = parts[parts.length - 3].split('/');
    const userPoolId = userPoolIdParts[userPoolIdParts.length - 1];
    const userPoolUserId = parts[parts.length - 1];
    this.authData = {
      cognitoIdentityPoolId,
      userArn,
      userPoolId,
      userPoolUserId,
      filter: `sub = "${userPoolUserId}"`,
    };
    logger.info({ authData: this.authData });
  }
  promise(...argv) {
    const name = argv.shift();
    return this.provider[name](argv.shift())
    .promise()
    .then(data => {
      logger.info({ name, data });
      return data;
    })
    .catch(e => {
      logger.error({ name, error: e.message });
      throw e;
    });
  }
  getUser() {
    const params = {};
    return this.promise('getUser', params)
    .then(user => {
      user.UserAttributes.forEach(store => {
        logger.info({ store });
      });
      return user;
    });
  }
  listUsers() {
    const params = {
      UserPoolId: this.authData.userPoolId,
    };
    return this.promise('listUsers', params)
    .then(data => {
      const { Users } = data;
      logger.info(Users);
      return Users;
    });
  }
  updateAttributes() {
    const attributes = [];
    const params = {
      Username: this.authData.Username,
      UserAttributes: attributes,
    };
    return this.promise('updateAttributes', params);
  }
}
module.exports = {
  User,
};
