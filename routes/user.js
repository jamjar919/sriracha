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
        
	app.get('/api/addsecrets/', function(req, res){
            console.log(req.query);
            if (
                (req.query.hasOwnProperty("username")) &&
                (req.query.hasOwnProperty("friendname")) &&
                (req.query.hasOwnProperty("date")) &&
                (req.query.hasOwnProperty("type")) &&
                (req.query.hasOwnProperty("secret")) 
            ) {
                var username = req.query.username;
                var friendname = req.query.friendname;
                var date = req.query.date;
                var type = req.query.type;
                var secret = req.query.secret;
                db.addNewSecret(username, friendname, date, type, secret)
                .then(function(data){
                    res.send(data);
                })
                .catch(function(error) {
                    res.send(error);
                });
            } else {
                res.send(JSON.stringify({error:"Please provide parameters username, friendname, date, type and secret"}));
            }
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
        
        app.get('/user/:user/add/', function(req,res) {})

	app.post('/user/:user/submit', function(req, res){
		console.log(req.query);
		var parameters = {
			user : req.params.user
		}
		res.render('profile', parameters);
	});

	return app;
}();
