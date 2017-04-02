"use strict";
// load dependencies
var express = require('express');
const pug = require('pug');
var app = express();
const server = require('http').Server(app);
var request = require('request');
var db = require('./database.js');

// manage views
app.set('views', __dirname + '/views')
app.engine('pug', require('pug').__express)
app.set('view engine', 'pug')
app.locals.basedir = __dirname + '/views';

//set up socket
const io = require('socket.io')(server);
require('./functions/socket')(io, server);


const port = process.env.PORT || 8080;

var baseurl;
if (process.env.NODE && ~process.env.NODE.indexOf("heroku")){
	baseurl = "https://sriracha-app.herokuapp.com:" + String(port);
} else {
	baseurl = "http://localhost:" + String(port);
}

app.use(express.static(__dirname + '/bower_components'));
app.use(express.static(__dirname + '/public'));


// users stuff
app.use('/', require('./routes/user'));

// webhook
app.use('/', require('./routes/webhook'));



var monzo = require('monzo-bank');
var accessToken;
var accountId;
try {
		var MonzoDevToken = require("../devtoken.json");
		accessToken = MonzoDevToken.token;
		accountId = MonzoDevToken.account_id;
		console.log("got james keys from json")
} catch (e) {
		console.log("got james keys from heroku")
		accessToken = process.env.MONZO_JAMES_TOKEN;
		accountId = process.env.MONZO_JAMES_ID;
}

var baseurl;
if (process.env.NODE && ~process.env.NODE.indexOf("heroku")) {
		baseurl = "https://sriracha-app.herokuapp.com:" + String(port);
		console.log("server is running on heroku");
} else {
		baseurl = "http://localhost:" + String(port);
		console.log("server is running locally");
}

// // monzo api
app.get("/monzo-connect", function(req, res) {
    console.log("going through monzo connect")
    if (req.query.hasOwnProperty("code")) {
      console.log("its actually going");
        var code = req.query.code;
        request.post('https://api.monzo.com/oauth2/token', {
            form: {
                grant_type: "authorization_code",
                client_id: MONZO_CLIENT_ID,
                client_secret: MONZO_CLIENT_SECRET,
                redirect_uri: baseurl + "/monzo-connect",
                code: code
            }
        }, function(error, response, body) {
            body = JSON.parse(body);
            if (body.hasOwnProperty("access_token")) {
                var username = Math.random().toString(36).slice(2);
                var name = "Default Name";
                var monzoid = body.user_id;
                db.addNewUser(username, realname, monzoid)
                .then(function(data) {
                    res.redirect("helpmebudget://monzo-connect?access_token=" + response.access_token + "&refresh_token=" + response.refresh_token + "&username=" + username + "&user_id="+monzoid);
                    // add a webhook for this user id
                    registerWebhookPromise = monzo.registerWebhook(monzoid, baseurl + "/webhook", response.access_token)
                    .then(function(data){
                            console.log("user has webhook registered! here's some data on it:", data);	
                    })
                })
                .catch(function(error) {
                    res.send(error);
                });
            } else {
                res.send(body);
            }
        });
    } else {
      console.log("sorry pal");
        res.send(JSON.stringify({
            error: "No code supplied"
        }));
    }
});


server.listen(port, function(){
	console.log("Server up on " + baseurl);
});
