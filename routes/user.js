module.exports = function(){
	var express = require('express');
	var app = express();
	app.locals.basedir = "." + '/views';

	//The 404 Route (ALWAYS Keep this as the last route)
	app.get('/user/:user/', function(req, res){
    console.log(req.params);

		var parameters = {
			user : req.params.user,
			secrets : getSecrets(req.params.user)
		}
		res.render('profile', parameters);
	});

	app.get('/:user/api/', function(req, res){
    console.log(req.params);
		var userid = req.params.user;
	});

	app.get('/user/:user/add/', function(req, res){
		var parameters = {
			user : req.params.user
		}
		res.render('add_secret', parameters);
	});

	app.post('/user/:user/submit', function(req, res){
		console.log(req.query);
		var parameters = {
			user : req.params.user
		}
		res.render('profile', parameters);
	});

	return app;
}();

function getSecrets(userid){
	var leaks = [
		{
			secret: "I peed my pants in secondary school",
			date: "20th January 2017",
			cause: "Spent £900 over budget on a night out."
		},
		{
			secret: "I peed my pants in secondary school",
			date: "20th January 2017",
			cause: "Spent £900 over budget on a night out."
		},
		{
			secret: "I peed my pants in secondary school",
			date: "20th January 2017",
			cause: "Spent £900 over budget on a night out."
		},
	]
	return leaks;
}
