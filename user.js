const AWS = require('aws-sdk');

let cognitoClient = new AWS.CognitoIdentityServiceProvider({ region: 'us-east-2' });
const getUserOfAuthenticatedUser = async event => {
    const userSub = event.requestContext.identity.cognitoAuthenticationProvider.split(':CognitoSignIn:')[1];
    const idd = userSub.split('/');
    const UserPoolId = idd[idd.length - 1];
    const request = {
        UserPoolId,
        Filter: `sub = "${userSub}"`,
        Limit: 1
    };
    const users = await cognitoClient.listUsers(request).promise();
    console.log("got user:", users[0]);
};
module.export = {
    getUserOfAuthenticatedUser,
};
