const AWS = require('aws-sdk');
class User {
  constructor(event) {
    const { CognitoIdentityServiceProvider } = AWS;
    const body = JSON.parse(event.body);
    const { accessToken } = body;
    AWS.config.update({ region: 'us-east-2' });
    this.provider = new CognitoIdentityServiceProvider({ accessToken });
    this.config(event);
  }
  config(event) {
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
    const promise = {};
    promise.instance = new Promise((...argv) => {
      [promise.resolve, promise.reject] = argv;
    });
    const name = argv.shift();
    this.provider[name](...argv, (e, res) => {
      if (e) {
        logger.error({ name, error: e.message });
        return promise.reject(e);
      }
      logger.info({ name, res: JSON.stringify(res, null, 2) });
      promise.resolve(res);
    });
    return promise.instance;
  }
  getUser() {
    const params = {};
    return this.promise('getUser', params)
    .then(users => {
      users.UserAttributes.forEach(store => {
        logger.info({ store });
      });
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
