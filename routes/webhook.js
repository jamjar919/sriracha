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
        var date_updated = data.updated;
        var persons_id = data.account_id;
        var amount = data.amount;
        manageTransaction()
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

}

function manageTransaction(){

}

function checkBudgetIsActive(){

}

function updateBudgetValue(user_id, amount){

}
