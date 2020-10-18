require("dotenv").config();
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const clients = {};
const responses = {};

function rawBody(req, res, next) {
  req.setEncoding("utf8");
  req.body = "";
  req.on("data", function (chunk) {
    req.body += chunk;
  });
  req.on("end", function () {
    next();
  });
}

const proxy = (req, res) => {
  const { headers, body, ip, method } = req;
  const id = req.params.id;
  const raw = JSON.stringify({
    path: req.params["0"] ? `/${req.params["0"]}` : "/",
    headers: { ...headers, "x-real-ip": ip, "socket-id": id },
    body,
    method,
  });

  if (clients[id]) clients[id].emit("request", raw);
  else {
    return res.status(404).send("not found.");
  }

  let timer = setTimeout(() => {
    clearInterval(interval);
    res.status(500).send("timeout.");
  }, 60000);

  let interval = setInterval(() => {
    if (responses[id]) {
      const data = responses[id];
      delete responses[id];
      clearInterval(interval);
      clearTimeout(timer);
      const response = JSON.parse(data);
      res.status(response.statusCode).send(response.body);
    }
  }, 200);
};

app.use(rawBody);
app.all("/proxy/:id/*", proxy);
app.all("/proxy/:id", proxy);
app.all("/test", (req, res) => res.json({ path: req.path, body: req.body }));

io.use(function (socket, next) {
  if (socket.handshake.query && socket.handshake.query.token) {
    if (socket.handshake.query.token === process.env.APP_KEY) {
      next();
    }
  } else {
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  console.log(`connected, id: ${socket.id}, ip: ${socket.conn.remoteAddress}`);

  if (!clients[socket.id]) {
    clients[socket.id] = socket;
  }

  socket.on("disconnect", (socket) => {
    delete clients[socket.id];
  });

  socket.on("request", (msg) => {
    responses[socket.id] = msg;
  });
});

const port = process.env.PORT || 3000;
http.listen(3000, () => {
  console.log("listening on localhost:" + port);
});
