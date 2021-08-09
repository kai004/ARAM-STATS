var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("matchesDB");
  dbo.createCollection("matches", function(err, res) {
    if (err) throw err;
    console.log("Collection created!");
    db.close();
  });
});