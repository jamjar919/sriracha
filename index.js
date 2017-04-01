"use strict";
// load dependencies
var express = require('express');
var app = express();
var http = require('http').Server(app);;

const port = process.env.PORT || 8080;

app.get("/", function(req, res) {
    res.send("hot hot heat");
});

http.listen(port, function(){
    console.log("Server up on http://localhost:%s", port);
});