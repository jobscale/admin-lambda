# AdminCognito from ApiGateway with Amplify

```bash
docker run --rm -v "$(pwd)/task":/var/task lambci/lambda:nodejs8.10 index.handler $(printf '%s' $(cat data.json))
```
