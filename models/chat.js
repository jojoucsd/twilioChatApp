var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('./users.js')
var Message = require('./message.js')

var ChatSchema = new Schema({
	name: {type: String, require: true},
	number: {type: String, require: true},
	user: [{ type: Schema.ObjectId, ref: 'User' }],
	// user: [{type : User.Schema.Types.ObjectId}], // chats are associated with a specific user
	messages: [Message.schema] // chats have a collection of messages
})

var Chat = mongoose.model('Chat', ChatSchema);

module.exports = Chat;