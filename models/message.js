var mongoose = require('mongoose');

var MessageSchema = mongoose.Schema({
	Body: String,
	To: String, // this will be someone sending to / receiving from my Twilio number
	From: String, // this will be my Twilio number
	FromCity: String,
	FromState: String
})


var Message = mongoose.model('Message', MessageSchema);

module.exports = Message;