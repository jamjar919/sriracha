module.exports = function(){
    var express = require('express');
    var app = express();
    var db = require('./../database.js');
    app.locals.basedir = "." + '/views';

    app.post('/webhook', function(req, res){

      console.log(req.body);
      res.status(200);
      res.send();
    });

    return app;
}();
