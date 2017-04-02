// https://github.com/solidgoldpig/monzo-bank
var monzo = require('monzo-bank');
const port = process.env.PORT || 8080;
var express = require('express');
var app = express();
app.locals.basedir = "." + '/views';


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







}
