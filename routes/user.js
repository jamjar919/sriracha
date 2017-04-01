module.exports = function(){
	var express = require('express');
	var app = express();
	// app.locals.basedir = "." + '/views';

	//The 404 Route (ALWAYS Keep this as the last route)
	app.get('/:user/', function(req, res){
    console.log(req.params);
		var userid = req.params.user;
	});

	app.get('/:user/api/', function(req, res){
    console.log(req.params);
		var userid = req.params.user;
	});

	return app;
}();
