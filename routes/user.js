module.exports = function(){
	var express = require('express');
	var app = express();
	app.locals.basedir = "." + '/views';

	//The 404 Route (ALWAYS Keep this as the last route)
	app.get('/user/:user/', function(req, res){
    console.log(req.params);
		// var userid = req.params.user;

		var leaks = [
			{
				secret: "I peed my pants in secondary school",
				date: "20th January 2017",
				cause: "Spent £900 over budget on a night out."
			},
		]

		var parameters = {
			user : req.params.user,
			secrets : leaks
		}
		res.render('profile', parameters);
	});

	app.get('/:user/api/', function(req, res){
    console.log(req.params);
		var userid = req.params.user;
	});

	return app;
}();
