"use strict";
// load dependencies
var express = require('express');
const pug = require('pug');
var app = express();
const server = require('http').Server(app);
var request = require('request');

// manage views
app.set('views', __dirname + '/views')
app.engine('pug', require('pug').__express)
app.set('view engine', 'pug')
app.locals.basedir = __dirname + '/views';

// Monzo Secret
var MonzoKeys = require('./monzosecret.json');
const MONZO_CLIENT_ID = MonzoKeys.client_id;
const MONZO_CLIENT_SECRET = MonzoKeys.client_secret;

// Mongo
var MongoClient = require('mongodb').MongoClient;
var dbCreds = require("./database.json");
const MONGO_USER = dbCreds.user;
const MONGO_PASS = dbCreds.pass;
const MONGO_URI = "mongodb://"+MONGO_USER+":"+MONGO_PASS+"@ds147510.mlab.com:47510/sriracha"
MongoClient.connect(MONGO_URI, function(err, db) {
    console.log("Connected successfully to remote database");
    db.close();
});

// Development dev token
var MonzoDevToken = require("./devtoken.json");
var accessToken = MonzoDevToken.token;
var accountId = MonzoDevToken.account_id;

// Monzo API wrapper
// https://github.com/solidgoldpig/monzo-bank
var monzo = require('monzo-bank');

const port = process.env.PORT || 8080;

function registerNewUser(username, realname) {
    return new Promise(function(resolve,reject) {
        MongoClient.connect(MONGO_URI, function(err, db) {
            var collection = db.collection('users');
            collection.insertOne({
                username:username,
                name:realname,
                friends:[{name:"James Paterson",phone:"07908102754"}],
                secrets:[{name:"James Paterson",secret:"he likes memes"}]
            }, function(err,r) {
                if (err == null) {
                    resolve(r);
                } else {
                    reject(err,r);
                }
            });
            db.close();
        });
    });
}

function isFriendInFriendList(friendname, friends) {
    for (var i = 0; i < friends.length; i++) {
        if (friendname == friends[i]) {
            return true;
        }
    }
    return false;
}

function addNewSecret(username, friendname, secret) {
    return new Promise(function(resolve,reject) {
        MongoClient.connect(MONGO_URI, function(err, db) {
            var user = db.collection('users').findOne({username:username})
            if (isFriendInFriendList(friendname, user.friends)) {
                // add the secret
                var newSecrets = user.secrets;
                newSecrets.push({name:friendname, secret:secret});
                col.updateOne({username:username}, {$set: {secrets: newSecrets}}, {
                        upsert: true
                    },
                    function(err, r) {
                        if (err == null) {
                            resolve(r);
                        } else {
                            reject(err,r);
                        }
                    }
                );
            }
        });
    });
}

function isValidToken(token) {
    return new Promise(function(resolve, reject) {
        monzo.tokenInfo(token)
        .then(function(data) {
            console.log(data);
            if (data.hasOwnProperty("authenticated")) {
                if (data.authenticated) {
                    resolve();
                } else {
                    reject();
                }
            } else {
                reject(data); // Api returned the wrong header for some reason
            }
        })
        .catch(function(data) {
            reject(data)
        }); // Something bad happened with the API
    });
}

app.get("/monzo-connect", function(req, res) {
    if (req.query.hasOwnProperty("code")) {
        var code = req.query.code;
        request.post('https://api.monzo.com/oauth2/token', {form:{
            grant_type:"authorization_code",
            client_id: MONZO_CLIENT_ID,
            client_secret: MONZO_CLIENT_SECRET,
            redirect_uri: "/monzo-connect",
            code: code
        }}, function (error, response, body) {
            if (body.hasOwnProperty("access_token")) {
                res.redirect("helpmebudget://monzo-connect?access_token="+response.access_token+"&refresh_token="+response.refresh_token);
            } else {
                res.send(body);
            }
        });
    } else {
        res.send(JSON.stringify({error:"No code supplied"}));
    }
});

app.get("/", function(req, res) {
    isValidToken(accessToken)
    .then(function() {
        monzo.createFeedItem({
            account_id: accountId,
            params: {
                title: "siracha sauce best sauce "+Math.random().toString(36).substring(7),
                body: "something else",
                image_url: "https://www.i.imgur.com/TWad5CE.gif"
            }
        }, accessToken)
        .then(function(data) {
            res.send(data);
        })
        .catch(function(data) {
            res.send(data);
        });
    })
    .catch(function() {
        // Refresh the token!
        // TODO Do we get a refresh token? If so where from?
        //monzo.refreshToken(accessToken)
        //.then(function(data) {
        //    res.send("refreshed token");
        //}).catch(function(data) {
        //    // Refresh failed
        //    res.send("Invalid token");
        //});
        console.log("user has bad token");
        res.send("your token sucks");
    })
});

app.use(express.static(__dirname + '/bower_components'));
app.use(express.static(__dirname + '/public'));

// users stuff
app.use('/', require('./routes/user'));

server.listen(port, function(){
    console.log("Server up on http://localhost:%s", port);
});
