var express = require('express');
var server = express();
const apiRoute = require("./routes/api");

server.use(express.static(__dirname + "/public"));

server.use("/api", apiRoute);

server.use((req, res) => res.sendFile(__dirname + "/public/index.html"));

server.listen(process.env.PORT || 5000);