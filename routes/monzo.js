var MONZO_CLIENT_ID;
var MONZO_CLIENT_SECRET;

// Monzo Secret
try {
    var MonzoKeys = require('./monzosecret.json');
    MONZO_CLIENT_ID = MonzoKeys.client_id;
    MONZO_CLIENT_SECRET = MonzoKeys.client_secret;
    console.log("got local monzo secret keys from json")
} catch (e) {
    MONZO_CLIENT_ID = process.env.MONZO_CLIENT_ID;
    MONZO_CLIENT_SECRET = process.env.MONZO_CLIENT_SECRET;
    console.log("got local monzo secret keys from heroku")
}

// Development dev token
var accessToken;
var accountId;
try {
    var MonzoDevToken = require("./devtoken.json");
    accessToken = MonzoDevToken.token;
    accountId = MonzoDevToken.account_id;
    console.log("got james keys from json")
} catch (e) {
    console.log("got james keys from heroku")
    accessToken = process.env.MONZO_JAMES_TOKEN;
    accountId = process.env.MONZO_JAMES_ID;
}

// Monzo API wrapper
// https://github.com/solidgoldpig/monzo-bank
var monzo = require('monzo-bank');
const port = process.env.PORT || 8080;
var baseurl;
if (process.env.NODE && ~process.env.NODE.indexOf("heroku")) {
    baseurl = "https://sriracha-app.herokuapp.com:" + String(port);
} else {
    baseurl = "http://localhost:" + String(port);
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

var express = require('express');
var app = express();
app.locals.basedir = "." + '/views';

module.exports = function() {

    app.get("/monzo-connect", function(req, res) {
        if (req.query.hasOwnProperty("code")) {
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
                    res.redirect("helpmebudget://monzo-connect?access_token=" + response.access_token + "&refresh_token=" + response.refresh_token);
                } else {
                    res.send(body);
                }
            });
        } else {
            res.send(JSON.stringify({
                error: "No code supplied"
            }));
        }
    });



    /*
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
    */

}
