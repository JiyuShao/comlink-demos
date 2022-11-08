const Express = require("express");
const http = require("http");
const { join, resolve } = require("path");


const app = Express();

// 需要先进入 /packages/shadowrealm-api 打包 npm run build
app.use("/shadowrealm-api/", Express.static(resolve(__dirname, "../shadowrealm-api/dist/")));

app.use("/browser-vm/", Express.static(resolve(__dirname, "../browser-vm/lib/")));

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "./index.html"));
});

app.get("/main.js", (req, res) => {
  res.sendFile(join(__dirname, "./main.js"));
});

app.get("/code.js", (req, res) => {
  res.sendFile(join(__dirname, "./code.js"));
});

const server = http.createServer(app);

server.listen("8080");