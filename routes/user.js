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

    /**
     * 
     * A C T U A L   W E B   P A G E S
     * 
     **/
    // Render user profile
    app.get('/user/:user/', function(req, res) {
        console.log(req.params);
        db.getUser(req.params.user)
            .then(function(user) {
                var parameters = {
                    user: user.username,
                    secrets: user.secrets,
                    budget: user.budget,
                    budgethistory: user.budgethistory
                }
                res.render('profile', parameters);
            })
            .catch(function(error) {
                res.send(error)
            });
    });
    
    // Display the add page for a friend (display only if key is valid)
    app.get('/user/:user/add/:key/', function(req, res) {
        var parameters = {
            user: req.params.user,
            key: req.params.key
        }
        db.isValidAddSecretKey(parameters.user, parameters.key)
        .then(function(friend){
            parameters.friendname = friend.name;
            res.render('add_secret', parameters);
        })
        .catch(function(error) {
            console.log(error);
            res.render('add_secret_fail', parameters);
        });
    });
    
    
    /**
     * 
     * A P I ' S
     * 
     **/
    
    // Add a new user
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

    // Add a secret to a user
    app.post('/user/:user/api/addsecret/', function(req, res) {
        console.log(req.query);
        if (
            (req.query.hasOwnProperty("friendname")) &&
            (req.query.hasOwnProperty("date")) &&
            (req.query.hasOwnProperty("type")) &&
            (req.query.hasOwnProperty("secret"))
        ) {
            var username = req.params.user;
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

    // Add a friend to a user with multiple phone numbers
    app.post('/user/:user/api/addfriend/', function(req, res) {
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

    // Get the friends of a user
    app.get("/user/:user/api/friends/", function(req, res) {
        var userid = req.params.user;
        db.getFriends(userid)
            .then(function(data) {
                res.send(JSON.stringify(data));
            });
    });
    
    
    /**
     * 
     * B U D G E T
     * 
     **/
    
    // Store the user budget
    app.post('/user/:user/api/budget/new/', function(req, res) {
        console.log(req.body);
        var parameters = {
            username: req.params.user,
            amount: req.body.amount,
            end: req.body.end,
        }
        // store these in the database
        db.addNewBudget(parameters.username, parameters.amount, parameters.end)
        .then(function(data) {
            res.send(JSON.stringify({
                "response": "ok",
                "message": data
            }));
        }).catch(function(data){
            // handle error here.
            console.log("wtf")
            res.send(data);
        });
    });
    
    
    // Add an amount to the user budget (like if they spent this amount of money)
    app.get("/user/:user/api/budget/add/", function(req, res) {
        console.log("adding to budget");
        var username = req.params.user;
        var amount = req.query.amount;
        if (amount != null) { 
            db.addToBudget(username, amount)
            .then(function(data) {
                res.send(JSON.stringify({
                    "response": "ok",
                    "message": data
                }));
            })
            .catch(function(data) {
                res.send(data);
            })
        } else {
            res.send(JSON.stringify({"error":"Must supply an amount as a GET parameter"}));
        }
    });
    
    // clear the budget
    app.get("/user/:user/api/budget/clear/", function(req, res) {
        console.log("clearing budget");
        var username = req.params.user;
        db.clearBudget(username)
        .then(function(data) {
            res.send(JSON.stringify({
                "response": "ok",
                "message": data
            }));
        })
        .catch(function(data) {
            res.send(data);
        })
    });

    return app;
}();
