"use strict";
// load dependencies
var express = require('express');
var app = express();
var http = require('http').Server(app);
var passport = require('passport');
var MonzoStrategy = require('passport-monzo').Strategy;
var MonzoKeys = require('./monzosecret.json');
var MonzoDevToken = require("./devtoken.json");
var monzo = require('monzo-bank');
const MONZO_CLIENT_ID = MonzoKeys.client_id;
const MONZO_CLIENT_SECRET = MonzoKeys.client_secret;
const port = process.env.PORT || 8080;
var accessToken = MonzoDevToken.token;

app.get("/", function(req, res) {
    accessToken = "";
    tokenInfoPromise = monzo.tokenInfo(accessToken)
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