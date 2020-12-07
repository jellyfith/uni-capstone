var express = require('express');
var bodyParser = require('body-parser');
var server = express();
const apiRoute = require("./routes/api");

server.use(bodyParser.urlencoded({extended:true}));
server.use(bodyParser.json());

server.use(express.static(__dirname + "/public"));

server.use("/api", apiRoute);

server.use((req, res) => res.sendFile(__dirname + "/public/index.html"));

server.listen(process.env.PORT || 8080);