require("dotenv").config();
const io = require("socket.io-client");
const request = require("request");

const remoteUrl = "http://localhost:3000";
const localUrl = "http://localhost:3000";
const ioClient = io.connect(remoteUrl);

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

      ioClient.emit(
        "request",
        JSON.stringify({ statusCode: response.statusCode, body })
      );
    }
  );
});
