# tunnely

friendly way to share local servers. (like ngrock)

## setup

deploy to the cloud, and run node server.js

to expose local server run the client.js with --local flag.

make sure to check the .env file.

## usage

```sh
node client.js --local=http://localhost:3000
node client.js --local=http://localhost:3000 --remote=https://remote-server-url
```

### TODO

- persist data
- add cache
  