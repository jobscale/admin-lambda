const Cognito = require('amazon-cognito-identity-js');
class Guest {
  async signIn(options) {
    const { ClientId, Username, Password } = require('./guest.json');
    const { AuthenticationDetails, CognitoUser, CognitoUserPool } = Cognito;
    return new Promise((resolve, reject) => {
      new CognitoUser({
        Username, Pool: new CognitoUserPool({
          UserPoolId: options.userPoolId,
          ClientId,
        }),
      }).authenticateUser(new AuthenticationDetails({
        Username , Password,
      }), {
        onSuccess: res => resolve(res.getAccessToken().getJwtToken()),
        onFailure: e => reject(e),
        newPasswordRequired: () => reject(new Error('newPasswordRequired')),
      });
    });
  }
}
module.exports = {
  Guest,
};
