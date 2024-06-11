const app = require("./backend/app");

const http = require("http");

const port = process.env.PORT || "3500";
app.set("port", port);

const server = http.createServer(app);
server.listen(port);
