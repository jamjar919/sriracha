module.exports = function(){
  var express = require('express');
  var app = express();
  var db = require('./../database.js');
  var twilio = require('../functions/twilio.js');
  app.locals.basedir = "." + '/views';

  app.post('/webhook', function(req, res){

    console.log(req.body);

    if (req.body.type === "transaction.created"){
      console.log("we have a transaction created");
      // we know it's a transaction, lets see what it does.
      var data = req.body.data;
      var date_updated = new Date(data.updated);
      var monzo_id = data.account_id;
      var amount = data.amount;

      db.monzoIdToUsername(monzo_id)
      .then(function(username){
        console.log("got username:", username);

        db.getBudget(username)
        .then(function(result){
          console.log("got budget:",result);

          if(result.end){
            var end_date = new Date(result.end);
            if (end_date > date_updated){
              console.log("date is within the budget range");
              if (result.value + amount > result.amount){
                console.log("user overspent");

                db.exposeNewSecret(username)
                .then(function(data){
                  console.log("user has secret exposed");
                  // do twilio shit

                  console.log(data);
                  var msg = "Your mate " + data.owner + " has exposed a secret: " + data.secret;
                  if (data.image_url){
                    msg += " " + data.image_url;
                  }
                  console.log(msg);
                  twilio.sendExploit(username, msg);
                })
                .catch(function(error){
                  console.log("got some errors here:", error)
                })

                db.addToBudget(username, amount)
                .then(function(data){
                  console.log("user amount increased");
                  db.clearBudget(username).then(function(data){
                    console.log("user budget is now reset");
                  })
                })

              }
              else {
                console.log("adding to the users budget");
                db.addToBudget(username, amount)
                .then(function(data){
                  console.log("user amount increased");
                })
              }
            } else {
              console.log("we surpassed the date tho")
              db.clearBudget(username);
            }
          }

        })
        .catch(function(error){
          console.log('we found an error',error);
        })
      })
      .catch(function(error){
        console.log("username not found")
      })
    } else {
      console.log("some other request");
    }
    // send nice response back to monzo
    res.status(200);
    res.send();
  });

  return app;
}();
