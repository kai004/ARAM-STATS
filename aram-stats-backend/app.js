const express = require('express');
const mongoose = require('mongoose');
const matches = require('./models/matches.model');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const db = "mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false"
mongoose.Promise = global.Promise;

mongoose.connect (db, {useNewUrlParser: true, useUnifiedTopology: true },function(err){
    if(err){
        console.error("Error!" + err);
    }
});

app.use(bodyParser.json());
app.use(cors());

var summonersRouter = require('./routes/summoners');
app.use('/summoners', summonersRouter);

app.post('/summoner', function(req, res){
    console.log(req.body);
    console.log(req.body.summonerName); //asdf
    res.status(200).send({"message":"data received"});
})

app.get('/getData', (req, res) =>{
    res.json({
        "statusCode" : 200,
        "statusMessage" : "Success"
    })
})

app.listen(3000, (req,res) =>{
    console.log("express listen at 3000");
})