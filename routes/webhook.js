module.exports = function(){
  var express = require('express');
  var app = express();
  var db = require('./../database.js');
  app.locals.basedir = "." + '/views';

  app.post('/webhook', function(req, res){

    console.log(req.body);

    if (req.body.type === "transaction.created"){
      // we know it's a transaction, lets see what it does.
      var data = req.body.data;
      var date_updated = new Date(data.updated);
      var monzo_id = data.account_id;
      var amount = data.amount;

      // get the username
      db.monzoIdToUsername(monzo_id)
        .then(function(username){
          // then get the username's budget value
          return db.getBudget(username);
        }).then(function(result){
            // check the date first
            if (result.time < date_updated){
              // then check if the budget is ok after adding
              if (result.value += amount > result.value){
                // if it is:
                // expose secrets
                db.exposeNewSecret(username);
                // send twilio stuff
                // reset.
                db.clearBudget(username);
              } else {
                // increment it; they're still in the budget.
              }
            } else {
              // we've surpassed the date. they're in the budget.
              db.clearBudget(username);
            }
          })
        .catch(function(error){
          // we can't find this username.
          console.log("a username isn't found pal, but heres an error message: ", error)
        })
    }
    // send nice response back to monzo
    res.status(200);
    res.send();
  });

  return app;
}();
