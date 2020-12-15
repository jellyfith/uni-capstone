const express = require('express');
let router = express.Router();
const db_manager = require('../db_manager');
db_manager.initializeDB().then(() => {
    
    router.post('/setEvent', function(req, res, next) {
        res.send(db_manager.setEvent(req.body));
        next();
    });
    router.get('/getPlan', function(req, res, next) {
        db_manager.getPlan(req.query).then(data => {
            res.send(data);
        });
    });
    router.get('/searchForPlan', function(req, res, next) {
        db_manager.searchForPlan(req.query).then(data => {
            res.send(data);
        });
    });
    router.post('/savePlan', function(req, res, next) {
        db_manager.savePlan(req.body).then(data => {
            res.send(data);
        });
    });
});

module.exports = router;