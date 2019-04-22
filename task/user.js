/*global logger  */
const AWS = require('aws-sdk');
class User {
  constructor(event) {
    const { CognitoIdentityServiceProvider } = AWS;
    const { accessToken } = event.body;
    logger.info({ AccessToken: accessToken });
    AWS.config.update({ region: 'us-east-2' });
    const params = { AccessToken: accessToken };
    this.provider = new CognitoIdentityServiceProvider({ params });
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
    .then(users => {
      logger.info({ users });
      return users;
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
