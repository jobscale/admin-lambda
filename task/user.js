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
    const accessToken = event.body && JSON.parse(event.body).accessToken;
    this.authData = {
      groupName: 'admin',
      userName: userPoolUserId,
      cognitoIdentityPoolId,
      userArn,
      userPoolId,
      userPoolUserId,
      accessToken,
      filter: `sub = "${userPoolUserId}"`,
    };
    logger.info({ authData: this.authData });
    const params = {
      AccessToken: this.authData.accessToken,
    };
    logger.info({ params });
    const { CognitoIdentityServiceProvider } = AWS;
    this.provider = new CognitoIdentityServiceProvider({ params });
  }

  promise(...argv) {
    const promise = {};
    promise.instance = new Promise((...argv) => {
      [promise.resolve, promise.reject] = argv;
    });
    const name = argv.shift();
    this.provider[name](...argv, (e, data) => {
      if (e) {
        logger.error({ error: `[${name}] ${e.message}` });
        return promise.reject(e);
      }
      logger.info({ success: `[${name}] ${JSON.stringify(data, null, 2)}` })
      promise.resolve(data);
    });
    return promise.instance;
  }

  getUser() {
    const params = {};
    return this.promise(
      'getUser', params,
    )
    .then(user => {
      user.UserAttributes.forEach(store => {
        logger.info({ store });
      });
    });
  }

  getUserInGroup() {
    const params = {
      GroupName: this.authData.groupName,
      UserPoolId: this.authData.userPoolId,
    };
    return this.promise(
      'listUsersInGroup', params,
    );
  }

  adminUpdateUserAttributes() {
    const params = {
      UserAttributes: [{
        Name: 'attribute',
        Value: JSON.stringify({ count: 0 }),
      }],
      UserPoolId: this.authData.userPoolId,
      Username: this.authData.userName,
    };
    return this.promise(
      'adminUpdateUserAttributes', params,
    );
  }
}

module.exports = {
  User,
};
