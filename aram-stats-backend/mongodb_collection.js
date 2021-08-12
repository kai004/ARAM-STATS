var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://kai004:D!UW_a-tycf6Per@cluster0.asuc8.mongodb.net/test";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("matchesDB");
  dbo.createCollection("user_model", function(err, res) {
    if (err) throw err;
    console.log("Collection created!");
    db.close();
  });
}); 