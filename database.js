var MongoClient = require('mongodb').MongoClient;
var dbCreds = require("./database.json");
const MONGO_USER = dbCreds.user;
const MONGO_PASS = dbCreds.pass;
const MONGO_URI = "mongodb://"+MONGO_USER+":"+MONGO_PASS+"@ds147510.mlab.com:47510/sriracha"
MongoClient.connect(MONGO_URI, function(err, db) {
    console.log("Connected successfully to remote database");
    db.close();
});

module.exports.registerNewUser = function(username, realname) {
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

module.exports.addNewSecret = function(username, friendname, date, type, cause, secret) {
    return new Promise(function(resolve,reject) {
        MongoClient.connect(MONGO_URI, function(err, db) {
            var user = db.collection('users').findOne({username:username})
            if (isFriendInFriendList(friendname, user.friends)) {
                // add the secret
                var newSecrets = user.secrets;
                newSecrets.push({
                    name:friendname,
                    date: Date(date),
                    type:type,
                    cause: cause,
                    secret:secret
                });
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

module.exports.getFriends = function(username) {
    return new Promise(function(resolve,reject) {
        MongoClient.connect(MONGO_URI, function(err, db) {
            var user = db.collection('users').findOne({username:username})
            .then(function(data) {
                console.log(data);
                resolve(data.friends);  
            })
        });
    });
}

module.exports.getSecrets = function(username) {
    return new Promise(function(resolve,reject) {
        MongoClient.connect(MONGO_URI, function(err, db) {
            var user = db.collection('users').findOne({username:username})
            .then(function(data) {
                console.log(data);
                resolve(data.secrets);  
            })
        });
    });
}
