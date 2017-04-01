module.exports = function() {
    var express = require('express');
    var app = express();
    var db = require('./../database.js');
    app.locals.basedir = "." + '/views';
    var bodyParser = require('body-parser');
    app.use(bodyParser.json()); // support json encoded bodies
    app.use(bodyParser.urlencoded({
        extended: true
    })); // support encoded bodies

    //The 404 Route (ALWAYS Keep this as the last route)
    app.get('/user/:user/', function(req, res) {
        console.log(req.params);
        db.getSecrets(req.params.user)
            .then(function(data) {
                var parameters = {
                    user: req.params.user,
                    secrets: data
                }
                res.render('profile', parameters);
            });
    });

    app.get('/api/addsecrets/', function(req, res) {
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
                .then(function(data) {
                    res.send(data);
                })
                .catch(function(error) {
                    res.send(error);
                });
        } else {
            res.send(JSON.stringify({
                error: "Please provide parameters username, friendname, date, type and secret"
            }));
        }
    });

    app.post('/api/:user/addfriend/', function(req, res) {
        var username = req.params.user;
        if (
            (req.body.hasOwnProperty("name")) &&
            (req.body.hasOwnProperty("phoneNumbers"))
        ) {
            var friendname = req.body.name;
            var phones = req.body.phoneNumbers;
            db.addNewFriend(username, friendname, phones)
                .then(function(data) {
                    res.send(data);
                })
                .catch(function(error) {
                    res.send(error);
                });
        } else {
            res.send(JSON.stringify({
                error: "Please provide parameters name and phoneNumbers"
            }));
        }
    });

    app.post('/api/adduser/', function(req, res) {
        console.log(req.body);
        if (
            (req.body.hasOwnProperty("username")) &&
            (req.body.hasOwnProperty("name")) &&
            (req.body.hasOwnProperty("monzoid"))
        ) {
            var username = req.body.username;
            var realname = req.body.name;
            var monzoid = req.body.monzoid;
            db.addNewUser(username, realname, monzoid)
                .then(function(data) {
                    res.send(data);
                })
                .catch(function(error) {
                    res.send(error);
                });
        } else {
            res.send(JSON.stringify({
                error: "Please provide parameters username, name, monzoid"
            }));
        }
    });

    app.get("/user/:user/api/friends/", function(req, res) {
        var userid = req.params.user;
        db.getFriends(userid)
            .then(function(data) {
                res.send(JSON.stringify(data));
            });
    });

    app.get('/user/:user/add/:key/', function(req, res) {
        var parameters = {
            user: req.params.user,
            key: req.params.key
        }
        res.render('add_secret', parameters);
    });

    app.post('/user/:user/submit', function(req, res) {
        console.log(req.query);
        var parameters = {
            user: req.params.user
        }
        res.render('profile', parameters);
    });

    // api call to store users budget
    app.post('/user/:user/budget', function(req, res) {
        console.log(req.query);

        var parameters = {
            user: req.params.user,
            amount: req.params.amount,
            end: req.params.end
        }

        // store these in the database
        db.getFriends(addNewBudget)
            .then(function(data) {
                res.send(JSON.stringify({
                    "response": "ok",
                    "message": data
                }));
            });
    });

    return app;
}();
