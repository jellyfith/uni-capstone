const express = require('express');
let router = express.Router();
const db_manager = require('../db_manager');

router.get('/', function(req, res, next) {
    next();
});

router.post('/setEvent', function(req, res, next) {
    res(db_manager.setEvent(req.body));
    next();
});

module.exports = router;