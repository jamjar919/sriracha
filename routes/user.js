module.exports = function(){
	var express = require('express');
	var app = express();
        var db = require('./../database.js');
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
        
        app.get("/:user/api/secrets/", function(req, res) {
            var userid = req.params.user;
            db.getSecrets(userid)
            .then(function(data) {
                res.send(JSON.stringify(data));
            });
        });
        
        app.get("/:user/api/friends/", function(req, res) {
            var userid = req.params.user;
            db.getFriends(userid)
            .then(function(data) {
                res.send(JSON.stringify(data));
            });
        });
	return app;
}();
