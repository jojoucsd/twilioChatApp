var mongoose = require('mongoose');

var MessageSchema = mongoose.Schema({
	body: String,
	to: String, // this will be someone sending to / receiving from my Twilio number
	from: String // this will be my Twilio number
})

var Message = mongoose.model('Message', MessageSchema);

module.exports = Message;