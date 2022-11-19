const Express = require("express");
const http = require("http");
const { join, resolve } = require("path");


const app = Express();

// 需要先进入 /packages/shadowrealm-api 打包 npm run build
app.use("/shadowrealm-api/", Express.static(resolve(__dirname, "../shadowrealm-api/dist/")));

// 需要先进入 /packages/comlink 打包 npm run build
app.use("/comlink/", Express.static(resolve(__dirname, "../comlink/dist/")));

// 代理本地文件供 shadowRealm.importValue 使用
app.use("/local-comlink/", Express.static(resolve(__dirname, "./local-comlink")));

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "./index.html"));
});

app.get("/main.js", (req, res) => {
    res.sendFile(join(__dirname, "./main.js"));
  });

const server = http.createServer(app);

server.listen("8080");