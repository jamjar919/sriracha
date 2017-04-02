module.exports = function(){
  var express = require('express');
  var app = express();

  app.locals.basedir = "." + '/views';

  app.get('/', function(req, res){
    res.render('index');
  });

  return app;
}();
