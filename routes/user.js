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


    function getDayString(number){
      var day;
      switch (number) {
    case 0:
        day = "Sunday";
        break;
    case 1:
        day = "Monday";
        break;
    case 2:
        day = "Tuesday";
        break;
    case 3:
        day = "Wednesday";
        break;
    case 4:
        day = "Thursday";
        break;
    case 5:
        day = "Friday";
        break;
    case 6:
        day = "Saturday";
      }
      return day;
    }

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
              console.log(user);
              console.log(user.budget);
              user.budget.endday =  getDayString(new Date(user.budget.end).getDay());
              user.budget.endtime = new Date(user.budget.end).getTime();
                var parameters = {
                    user: user.name,
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
    app.get('/user/:user/api/addsecret/', function(req, res) {
        console.log(req.query);
        if (
            (req.query.hasOwnProperty("friendname")) &&
            (req.query.hasOwnProperty("text"))
        ) {
            var username = req.params.user;
            var friendname = req.query.friendname;
            var date = new Date();
            var image_url = null;
            if (req.query.hasOwnProperty("image_url")) {
                image_url = req.query.image_url;
            }
            var secret = req.query.text;
            db.addNewSecret(username, friendname, date, image_url, secret)
                .then(function(data) {
                    res.send(data);
                })
                .catch(function(error) {
                    res.send(error);
                });
        } else {
            res.send(JSON.stringify({
                error: "Please provide parameters text and friendname"
            }));
        }
    });

    // Update the stored name
    app.post('/user/:user/api/name',function(req,res) {
        var username = req.params.user;
        console.log(req.body);
        if (req.body.hasOwnProperty("name")) {
            var newName = req.body.name;
            db.changeName(username, newName)
            .then(function(data){
                res.send(JSON.stringify({
                    "response": "ok",
                    "message": data
                }));
            })
            .catch(function(error){
                res.send(JSON.stringify({
                    "error":error
                }));
            })
        } else {
            res.send(JSON.stringify({
                error: "Please provide parameter name"
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

    // Get the user budget
    app.get('/user/:user/api/budget/', function(req, res) {
        db.getUser(req.params.user)
        .then(function(data) {
            res.send(JSON.stringify(data.budget));
        }).catch(function(data){
            // handle error here.
            console.log("wtf")
            res.send(data);
        });
    });

    // Store the user budget
    app.post('/user/:user/api/budget/new/', function(req, res) {
        console.log(req.body);
        var parameters = {
            username: req.params.user,
            amount: req.body.amount,
            end: new Date(req.body.end),
        }
        console.log(parameters);
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
