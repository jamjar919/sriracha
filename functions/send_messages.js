var twilio = require('twilio');

var accountSid = '{{ account_sid }}'; // Your Account SID from www.twilio.com/console
var authToken = '{{ auth_token }}';   // Your Auth Token from www.twilio.com/console
var client = new twilio.RestClient(accountSid, authToken);

function getContacts(user_id){
  var contacts = [];
}

function getSecretMessage(user_id,secret_id){
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
      from: '+12345678901' // From a valid Twilio number
  }, function(err, message) {
      console.log("There was an error involved with sending a message");
      console.log(message.sid);
  });
}
