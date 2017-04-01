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

// monzo api
app.use('/', require('./routes/monzo'));
// users stuff
app.use('/', require('./routes/user'));

//webhook
app.use('/', require('./routes/webhook'));


server.listen(port, function(){
	console.log("Server up on " + baseurl);
});
