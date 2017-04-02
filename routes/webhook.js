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
        var persons_id = data.account_id;
        var amount = data.amount;

        // get the username
        db.getUsername(persons_id)
          .then(function(username){
            // then get the username's budget value
            db.getBudget(username)
              .then(function(result){
                // check the date first
                if (result.time < date_updated){
                  // then check if the budget is ok after adding
                  if (result.value += amount > result.value){
                    // if it is:
                      // expose secrets
                      db.exposeNewSecret(username)
                      // send twilio stuff
                      // reset.
                  } else {
                    // increment it
                  }
                } else {
                  // we've surpassed the date.
                }
              })
              .catch(function(error){
                // we don't have a budget for this person!
              });
          })
          .catch(function(error){
            // we can't find this username.
          })
      }
      // send nice response back to monzo
      res.status(200);
      res.send();
    });

    return app;
}();

function getUsername(person_id){

  return username;
}

function getBudget(username){
  db.getBudget(username)
  .then(function(data) {

  })
}

function manageTransaction(){

}

function checkBudgetIsActive(){

}

function updateBudgetValue(user_id, amount){

}
