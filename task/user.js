const AWS = require('aws-sdk');

const logger = console;

class User {
  constructor(event) {
    AWS.config.update({ region: 'us-east-2' });
    const { identity } = event.requestContext;
    const { cognitoAuthenticationProvider } = identity;
    const { cognitoIdentityPoolId, userArn } = identity;
    const parts = cognitoAuthenticationProvider.split(':');
    const userPoolIdParts = parts[parts.length - 3].split('/');
    const userPoolId = userPoolIdParts[userPoolIdParts.length - 1];
    const userPoolUserId = parts[parts.length - 1];
    const accessToken = event.headers['x-amz-security-token'];
    this.authData = {
      cognitoIdentityPoolId,
      userArn,
      userPoolId,
      userPoolUserId,
      accessToken,
      filter: `sub = "${userPoolUserId}"`,
    };
    logger.info({ authData: this.authData });
    this.options = {
      accessToken: this.authData.accessToken,
    };
    this.provider = new AWS.CognitoIdentityServiceProvider();
  }

  promise() {
    const promise = {};
    promise.instance = new Promise((...argv) => {
      [promise.resolve, promise.reject] = argv;
    });
    return promise;
  }

  getUser(attribute) {
    const promise = this.promise();
    if (!attribute) attribute = 'custom:attribute';
    this.provider.getUser({}, (e, user) => {
      if (e) {
        promise.reject(e);
        return;
      }
      user.UserAttributes.forEach((store) => {
        if (store.Name !== attribute) return;
        promise.resolve(store);
      });
      promise.reject(`'${attribute}' not found.`);
    });
    return promise.instance;
  }

  updateAttributes(attributes) {
    const promise = this.promise();
    this.provider.adminUpdateUserAttributes({
      Username: this.options.Username,
      UserAttributes: attributes,
    }, (e, res) => {
      if (e) {
        promise.reject(e);
        return;
      }
      promise.resolve(res);
    });
    return promise.instance;
  }
}

module.exports = {
  User,
};
