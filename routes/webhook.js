module.exports = function(){
    var express = require('express');
    var app = express();
    var db = require('./../database.js');
    
    app.get('/webhook', function(req, res){
        
    });
    
    return app;
}();