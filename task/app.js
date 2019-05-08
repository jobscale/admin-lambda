/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License").
You may not use this file except in compliance with the License.
A copy of the License is located at  http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file.
This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const { User } = require('./user');

// declare a new express app
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

const fronNameValue = list => {
  const result = {};
  list.forEach(item => {
    result[item.Name] = item.Value;
  });
  return result;
};
const toNameValue = items => {
  return Object.keys(items).map(key => ({
    Name: key,
    Value: items[key],
  }));
};

/** ********************
 * Example get method *
 ********************* */

app.get('/fetch', (req, res) => {
  // Add your code here
  res.json({ success: 'get call succeed!', url: req.url });
});

app.get('/fetch/*', (req, res) => {
  // Add your code here
  res.json({ success: 'get call succeed!', url: req.url });
});

/** **************************
 * Example post method *
 *************************** */

app.post('/fetch', (req, res) => {
  // Add your code here
  const { event } = req.apiGateway;
  event.body = req.body;
  const user = new User(event);
  user.setup()
  .then(() => user.getUser())
  .then(() => user.listUsers())
  .then(data => {
    const attributes = fronNameValue(data.Attributes);
    const result = {
      'custom:attribute': attributes['custom:attribute'],
    };
    if (result['custom:attribute']) {
      result['custom:attribute'] = (result['custom:attribute'] - 1).toString();
    } else {
      result['custom:attribute'] = (10).toString();
    }
    data.Attributes = toNameValue(result);
    return data;
  })
  .then(data => user.adminUpdateUserAttributes(data))
  .then(() => {
    res.json({
      success: 'post call succeed!', url: req.url,
    });
  })
  .catch(e => {
    logger.error(JSON.stringify(
      { message: e.message, stack: e.stack }, null, 2,
    ));
    res.json({
      error: e.message, url: req.url,
    });
  });
});

app.post('/fetch/*', (req, res) => {
  // Add your code here
  res.json({ success: 'post call succeed!', url: req.url, body: req.body });
});

/** **************************
 * Example post method *
 *************************** */

app.put('/fetch', (req, res) => {
  // Add your code here
  res.json({ success: 'put call succeed!', url: req.url, body: req.body });
});

app.put('/fetch/*', (req, res) => {
  // Add your code here
  res.json({ success: 'put call succeed!', url: req.url, body: req.body });
});

/** **************************
 * Example delete method *
 *************************** */

app.delete('/fetch', (req, res) => {
  // Add your code here
  res.json({ success: 'delete call succeed!', url: req.url });
});

app.delete('/fetch/*', (req, res) => {
  // Add your code here
  res.json({ success: 'delete call succeed!', url: req.url });
});

app.listen(3000, () => {
  logger.log('App started');
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
