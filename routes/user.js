module.exports = function(){
	var express = require('express');
	var app = express();
        var db = require('./../database.js');
	app.locals.basedir = "." + '/views';

	//The 404 Route (ALWAYS Keep this as the last route)
	app.get('/user/:user/', function(req, res){
            console.log(req.params);
            db.getSecrets(req.params.user)
            .then(function(data) {
                var parameters = {
			user : req.params.user,
			secrets : data
		}
		res.render('profile', parameters);
            });
	});
        

	app.get('/:user/api/', function(req, res){
            console.log(req.params);
            var userid = req.params.user;
	});
        
        app.get("/user/:user/api/friends/", function(req, res) {
            var userid = req.params.user;
            db.getFriends(userid)
            .then(function(data) {
                res.send(JSON.stringify(data));
            });
        });

	app.get('/user/:user/add/', function(req, res){
		var parameters = {
			user : req.params.user
		}

		res.render('add_secret', parameters);
	});

	return app;
}();
