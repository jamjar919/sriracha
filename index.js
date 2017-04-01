"use strict";
// load dependencies
var express = require('express');
var app = express();
var http = require('http').Server(app);

// Passport (For getting an auth token)
// https://github.com/tombell/passport-monzo
var passport = require('passport');
var MonzoStrategy = require('passport-monzo').Strategy;

// Sooper secret keys
var MonzoKeys = require('./monzosecret.json');
const MONZO_CLIENT_ID = MonzoKeys.client_id;
const MONZO_CLIENT_SECRET = MonzoKeys.client_secret;

// Development dev token
var MonzoDevToken = require("./devtoken.json");
var accessToken = MonzoDevToken.token;

// Monzo API wrapper
// https://github.com/solidgoldpig/monzo-bank
var monzo = require('monzo-bank');

const port = process.env.PORT || 8080;

function checkValidToken(token) {
}

app.get("/", function(req, res) {
    monzo.tokenInfo(accessToken)
    .then(function(data) {
        res.send(data);
    });
});

http.listen(port, function(){
    console.log("Server up on http://localhost:%s", port);
});

passport.use(new MonzoStrategy({
        clientID: MONZO_CLIENT_ID,
        clientSecret: MONZO_CLIENT_SECRET,
        callbackURL: "http://google.com"
    },
    function(accessToken, refreshToken, profile, cb) {
        User.findOrCreate({ monzoId: profile.id }, function (err, user) {
            return cb(err, user);
        });
    }
))

app.get('/auth/monzo', passport.authenticate('monzo'));

app.get('/auth/monzo/callback', 
    passport.authenticate('monzo', { failureRedirect: '/login' }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    }
);