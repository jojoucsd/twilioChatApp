// SERVER-SIDE JAVASCRIPT

// REQUIREMENTS //
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var db = require("./models/index");
var http = require ('http').Server(app);
var fs = require ('fs');
var qs = require('querystring');
var io = require('socket.io')(http);
var session =  require('express-session');
// require and load ENV variables
require('dotenv').load();

//io on , socket is open server side
io.on('connection', function(socket) {

	console.log("connected on server")

});

//twilio login info
var accountSid = process.env.TWILLIO_SID;
var authToken = process.env.TWILLIO_TOKEN;

var client = require('twilio')(accountSid, authToken);

//mongoose.connect('mongodb://localhost/twilioChat-login')
var db = require('./models/index');

//setting views and use modules
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
	saveUninitialized: true,
	resave: true,
	secret: 'SuperSecretCookie',
	cookie: { maxAge: 30 * 60 * 1000 }
}));

//Login Signup Routes
app.get('/', function(req, res) {
	res.render("index");
});

app.get('/signup', function (req, res) {
	res.render('signup');
});

app.post('/users', function (req, res) {
	console.log(req.body);
	db.User.createSecure(req.body.email, req.body.password, function (err, newUser) {
		req.session.userId = newUser._id;
		res.redirect('/chatcenter');
	});
});

// authenticate the user and set the session
app.post('/sessions', function (req, res) {
	console.log('attempted signin: ', req.body);
  // call authenticate function to check if password user entered is correct
  db.User.authenticate(req.body.email, req.body.password, function (err, loggedInUser) {
  	if (err){
  		console.log('authentication error: ', err);
  		res.status(500).send();
  		res.redirect('/');
  	} else {
  		console.log('setting session user id ', loggedInUser._id);
  		req.session.userId = loggedInUser._id;
  		res.redirect('/chatcenter');
  	}
  });
});

//loged in main page
// shows all chats
app.get('/chatcenter', function (req, res) {
	console.log('session user id: ', req.session.userId);
  // find the user currently logged in
  db.User.findOne({_id: req.session.userId}, function (err, currentUser) {
  	if (err){
  		console.log('database error: ', err);
  		res.redirect('/');
  	} else {
      // render profile template with user's data
      console.log('loading profile of logged in user: ', currentUser);
  }
  db.Chat.find({}, function(err, chats){
  	if (err) { res.json(err) }
  		console.log("chats to load for conversations-index", chats);
  	res.render('conversations-index',{chats: chats, user: currentUser});
  })
});
});

app.get('/logout', function (req, res) {
  // remove the session user id
  req.session.userId = null;
  // redirect to login (for now)
  res.redirect('/');
});

//Rotues for Main App
app.post('/chats', function (req, res){	
	//console.log(req.body);
	//create chats and save to MongoDB
	db.Chat.create(req.body, function(err, chat){
		if(err) {
			res.json(err);
		} else {
			//console.log(chat);
			res.json(chat);
		} 
	})
});

//find routes by id
app.get('/chats/:_id', function (req, res){
	console.log(req.params);
	db.Chat.findById(req.params._id).populate('messages').exec(function (err, chat){
		if (err) {
			res.json(err);
		}else{
			res.render('conversation-show', {chat: chat})
		}
	});
});

//should not be an delete route, will need to change in the future
app.delete('/chats/:_id', function (req, res){
	//console.log("chat id is", req.params);
	db.Chat.find({
		_id: req.params._id
	}).remove(function(err, chat){
	//	console.log("Chat Removed");
		res.json("Chat Gone?")
	})
})

// makes a message for a specific chat
app.post('/chats/:_id/messages', function (req, res) {	

	var message = new db.Message({Body: req.body.message});
	db.Chat.findById(req.body.chatId, function (err, chat){
		if(err) { 
			res.json(err); 
		}else{
			chat.messages.push(message);
			chat.save();
		}
		//Twilio API call
		client.messages.create({
			body: message.Body,
			to: chat.number,
			from: "+16504168665"
		}, function(err, message) {
			if (err) return console.error(err);
			console.log(message.sid);
			// res.send(message.sid);
		})
		//console.log('message is: ', message);
		//console.log('this chatroom messages are: ', chat.messages);
		// response to my browser client
		res.json(message);
	})
})

function createMessage(chat, message, callback) {
	//console.log(message)
	chat.messages.push(message);
	chat.save(function(err) {
		console.log(chat)    
		io.emit("message", message);
//twilio is expecting something else thant this callback, fix it later
		callback("good");
	});	
	
}
//inbound msg route
app.post('/message/recieve', function (req, res) {
	// Recieve message
//	console.log(req.body);
	var message = req.body;
//	console.log("incoming is :", message);
//	 	console.log(message.From)
	 	db.Chat.findOne({number: parseInt(message.From)}).exec(function (err, chat) {
	 		if (!chat) {
	 			db.Chat.create({ number: message.From }, function(err, chat) {
	 				createMessage(chat,message, function (message) {
	 					res.json(message)
	 				});
	 			});
	 		} else if(err) { 
	 			res.json(err) 
	 		} else {	
	 			createMessage(chat, message, function (message) {
	 				res.json(message)
	 			});
	 		}
	 	});
})


http.listen(process.env.PORT || 3000, function() {
	console.log("twilioChat is running on port 3000");
});

