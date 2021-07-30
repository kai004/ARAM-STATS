var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
const mongoose = require('mongoose');
const summonerModel = require('../models/matches.model');

router.get('/', function(req, res, next){
    res.send('Summoner respond');
});

router.get('/add', function(req, res, next){
    let newSummoner = new summonerModel({
        
    })
})

module.exports = router;