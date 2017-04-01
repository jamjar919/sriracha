var MongoClient = require('mongodb').MongoClient;

var MONGO_URI;
try {
  var dbCreds = require("./database.json");
  const MONGO_USER = dbCreds.user;
  const MONGO_PASS = dbCreds.pass;
  MONGO_URI = "mongodb://"+MONGO_USER+":"+MONGO_PASS+"@ds147510.mlab.com:47510/sriracha"
} catch (e) {
  MONGO_URI = process.env.MONGO_DB_URL;
}

MongoClient.connect(MONGO_URI, function(err, db) {
    console.log("Connected successfully to remote database");
    db.close();
});

module.exports.addNewUser = function(username, realname, monzoid) {
    return new Promise(function(resolve,reject) {
        MongoClient.connect(MONGO_URI, function(err, db) {
            var collection = db.collection('users');
            collection.insertOne({
                username:username,
                name:realname,
                monzoid: monzoid,
                friends:[{name:"James Paterson",phone:"07908102754"}],
                secrets:[{name:"James Paterson",type:"text",exposed:true,date:Date("2017-07-01"),secret:"he likes memes"}]
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
    console.log(friends);
    for (var i = 0; i < friends.length; i += 1) {
        console.log(i);
        if (friendname == friends[i].name) {
            return true;
        }
    }
    return false;
}

module.exports.addNewSecret = function(username, friendname, date, type, secret) {
    return new Promise(function(resolve,reject) {
        MongoClient.connect(MONGO_URI, function(err, db) {
            db.collection('users').findOne({username:username})
            .then(function(user) {
                if (user == null) {
                    reject({error:"User not found"});
                } else if (isFriendInFriendList(friendname, user.friends)) {
                    console.log("user found")
                    // add the secret
                    var newSecrets = user.secrets;
                    newSecrets.push({
                        name:friendname,
                        date: Date(date),
                        type:type,
                        exposed:false,
                        secret:secret
                    });
                    db.collection('users').updateOne({username:username}, {$set: {secrets: newSecrets}}, {
                            upsert: true
                        },
                        function(err, r) {
                            if (err == null) {
                                resolve(r);
                            } else {
                                console.log(err);
                                reject(err,r);
                            }
                        }
                    );
                } else {
                    reject({error: "Not a friend of the specified user"});
                }
            })
        });
    });
}

module.exports.addNewFriend = function(username, friendname, phones) {
    return new Promise(function(resolve,reject) {
        MongoClient.connect(MONGO_URI, function(err, db) {
            db.collection('users').findOne({username:username})
            .then(function(user) {
                if (user == null) {
                    reject({error:"User not found"});
                } else {
                    console.log("user found")
                    // add the secret
                    var newFriends = user.friends;
                    newFriends.push({
                        name:friendname,
                        phones:phones,
                        key: Math.random().toString(36).substring(7)
                    });
                    db.collection('users').updateOne({username:username}, {$set: {friends: newFriends}}, {
                            upsert: true
                        },
                        function(err, r) {
                            if (err == null) {
                                resolve(r);
                            } else {
                                console.log(err);
                                reject(err,r);
                            }
                        }
                    );
                }
            })
        });
    });
}

module.exports.addNewBudget = function(username,budget) {
    return new Promise(function(resolve,reject) {
        MongoClient.connect(MONGO_URI, function(err, db) {
            var user = db.collection('users').findOne({username:username})
            .then(function(data) {
                console.log(data);
                db.collection('users').updateOne({username:username}, {$set: {budget: budget}}, {
                        upsert: true
                    },
                    function(err, r) {
                        if (err == null) {
                            resolve(r);
                        } else {
                            console.log(err);
                            reject(err,r);
                        }
                    }
                );  
            })
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
