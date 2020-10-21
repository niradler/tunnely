require("dotenv").config();
const io = require("socket.io-client");
const request = require("request");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

let remoteUrl = process.env.REMOTE_SERVER;
let localUrl = process.env.LOCAL_SERVER;

const argv = yargs(hideBin(process.argv)).argv;
if (argv.local) localUrl = argv.local;
if (argv.remote) remoteUrl = argv.remote;

const ioClient = io.connect(remoteUrl, {
  query: { token: process.env.APP_KEY },
});

ioClient.on("connect", function () {
  if (ioClient.connected) {
    console.log(`id: ${ioClient.id}`);
    console.log(
      `connected: ${localUrl} <=> ${remoteUrl}/proxy/${ioClient.id}/`
    );
  } else console.log("please try again.");
});

ioClient.on("disconnect", function () {
  console.log("disconnected.");
});

ioClient.on("request", (msg) => {
  console.info(msg);
  const data = JSON.parse(msg);

  request(
    {
      method: data.method,
      uri: `${localUrl}${data.path}`,
      headers: data.headers,
      body: data.body,
    },
    function (error, response, body) {
      if (error) {
        console.error(error);
      }
      if (!response && error) {
        ioClient.emit(
          "request",
          JSON.stringify({ statusCode: 500, body: { error: error.message } })
        );
      } else {
        ioClient.emit(
          "request",
          JSON.stringify({ statusCode: response.statusCode, body })
        );
      }
    }
  );
});
