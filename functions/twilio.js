var fs = require('fs');
var twilio = require('twilio');
var db = require('./../database.js');

var tw = {};
try {
  tw = fs.readFileSync('../private/twilio.json');
  console.log("Secret twilio keys are found locally.");
} catch (err) {
  // secret file isn't found; load from server variables
  tw = {
      "account_id": process.env.TWILIO_ID,
      "auth_token": process.env.TWILIO_AUTH,
      "phone_number": process.env.TWILIO_PHONE
  }
}
var client = new twilio.RestClient(tw.account_id, tw.auth_token);
a
function getContacts(username){
  return db.getFriends(username);
}

function getSecretMessage(user_id,secret_id){
  // this is empty, will need to write a function for this!
  var message = "";
  return message;
}

function sendMessagesToContacts(user_id,secret_id){
  // get the contacts
  var contacts = getContacts(user_id);
  // get the secret message
  var message = getSecretMessage(secret_id);
  // send the message to each of the contacts
  for (var mates_number : contacts){
    sendMessageToContact(mates_number, message);
  }
}

function sendMessageToContact = function(phone_number, message) {
  client.messages.create({
      body: message,
      to: phone_number,  // Text this number
      from: tw.phone_number // From a valid Twilio number
  }, function(err, message) {
      console.log("There was an error involved with sending a message");
      console.log(message.sid);
  });
}
