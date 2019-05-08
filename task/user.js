const AWS = require('aws-sdk');
class User {
  constructor(event) {
    AWS.config.update({ region: 'us-east-2' });
    const { accessToken } = event.body;
    const { identity } = event.requestContext;
    const { cognitoAuthenticationProvider } = identity;
    const { cognitoIdentityPoolId, userArn } = identity;
    const parts = cognitoAuthenticationProvider.split(':');
    const userPoolIdParts = parts[parts.length - 3].split('/');
    const userPoolId = userPoolIdParts[userPoolIdParts.length - 1];
    const userPoolUserId = parts[parts.length - 1];
    this.authData = {
      accessToken,
      cognitoIdentityPoolId,
      userArn,
      userPoolId,
      userPoolUserId,
      filter: `sub = "${userPoolUserId}"`,
    };
  }
  async setup() {
    if (this.provider) throw Error('duplicate provider.');
    const { Config } = require('./config');
    const config = new Config();
    config.authData = this.authData;
    const options = {
      params: {
        AccessToken: this.authData.accessToken,
      },
    };
    return config.setup(options)
    .then(() => {
      const { CognitoIdentityServiceProvider } = AWS;
      options.accessKeyId = config.access;
      options.secretAccessKey = config.secret;
      this.provider = new CognitoIdentityServiceProvider(options);
    });
  }
  async getUser() {
    const params = {};
    return this.provider.getUser(params).promise()
    .then(data => {
      this.authData.Username = data.Username;
      return data;
    });
  }
  async listUsers() {
    const params = {
      UserPoolId: this.authData.userPoolId,
    };
    return this.provider.listUsers(params).promise()
    .then(data => {
      let result = undefined;
      const { Users } = data;
      Users.forEach(user => {
        if (user.Username === this.authData.Username) {
          result = user;
        }
      });
      logger.info(result);
      return result;
    });
  }
  async adminUpdateUserAttributes(user) {
    const params = {
      Username: user.Username,
      UserPoolId: this.authData.userPoolId,
      UserAttributes: user.Attributes,
    };
    return this.provider.adminUpdateUserAttributes(params).promise()
    .then(() => logger.info(params));
  }
}
module.exports = {
  User,
};
