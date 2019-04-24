# AdminCognito from ApiGateway with Amplify

```bash
git clone git@github.com:jobscale/admin-lambda.git admin-lambda
cd $_
npm i
cd task
npm i
echo '\
module.exports = {
  ACCESS: '<access>',
  SECRET: '<secret>',
};
' > env.js
cd -
vi event.json
npm run docker
zip -rll lambda task
```
