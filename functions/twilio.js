var fs = require('fs');
var twilio = require('twilio');
var db = require('./../database.js');

var tw = {};
try {
  console.log("trying to load local");
  tw = require('./../private/twilio.json');
  console.log("Secret twilio keys are found locally.");
} catch (err) {
  // secret file isn't found; load from server variables
  tw = {
      "account_id": process.env.TWILIO_ID,
      "auth_token": process.env.TWILIO_AUTH,
      "phone_number": process.env.TWILIO_PHONE
  }
  console.log("twilio keys are found on heroku")
}

console.log(tw.account_id);
console.log(tw.auth_token);

var client = new twilio.RestClient(tw.account_id, tw.auth_token);

function getSecretMessage(user_id,secret_id){
  // this is empty, will need to write a function for this!
  var message = "";
  return message;
}

function sendMessagesToContacts(user_id,message){
  db.getFriends(user_id)
  .then(function(contacts){
    console.log(contacts);
    // send the message to each of the contacts
    for (var mates_number in contacts){
      // console.log(contacts[mates_number].phone);
      sendMessageToContact(contacts[mates_number].phone, message);
    }
  })
}

module.exports.sendExploit = function(user_id, message){
  sendMessagesToContacts(user_id, message);
}

function sendMessageToContact (phono, message) {
  client.messages.create({
      body: message,
      to: phono,  // Text this number
      from: tw.phone_number // From a valid Twilio number
  }, function(err) {
      console.log("There was an error involved with sending a message");
      console.log(err);
  });
}
