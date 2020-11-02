var express = require('express');
var server = express();

server.use(express.static('public'));

server.listen(process.env.PORT || 5000);