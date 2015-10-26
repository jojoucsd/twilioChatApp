// SERVER-SIDE JAVASCRIPT

// REQUIREMENTS //
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var db = require("./models/index");
var http = require ('http');
var fs = require ('fs');
var qs = require('querystring');
// require and load ENV variables
require('dotenv').load();
// var secret = require('./secret');

// var accountSid = secret.twillio_sid;
// var authToken = secret.twillio_token;
var accountSid = process.env.TWILLIO_SID;

var client = require('twilio')(accountSid, authToken);


function twCall(inputNum, res) {
	client.calls.create({
		to: inputNum,
		from: "+16504168665",
		url: "http://demo.twilio.com/docs/voice.xml",
		applicationSid: "APa894ccc18916d5496c35bbe7bd7f07bc",
		method: "GET",
		fallbackMethod: "GET",
		statusCallbackMethod: "GET",
		record: "false"
	}, function(err, call) {
		if (err) return console.error(err);
		console.log(call.sid);
		res.render('food', {
			title: "twCall",
			message: "Call Section ID: " + call.sid,
			bravo: "Finish twCall"
		})
	});
};

function twText(inputNum, res) {
	client.messages.create({
		body: "This is Ling",
		to: keyIn.number,
		from: "+16504168665"
	}, function(err, message) {
		if (err) return console.error(err);
		console.log(message.sid);
		res.render('food', {
			title: "twText",
			message: "Message Section ID: " + message.sid,
			bravo: "Finish twText"
		})
	});
};

function twTextRec(url, res){
	// this gets a single message
	client.messages("SMef52737a542e41bc9dbd7d13fee926fa").get(function(err, message) {
		console.log(message.body);
	});
	// this is for getting all of the messages
	// client.messages.list(function(err, data){
	// 	data.messages.forEach(function(message){
	// 		console.log(message.body);
	// 		res.send(data);
	// 	});
	// });
}

// http.createServer(function (req, res) {
// 	var twiml = new twilio.TwimlResponse();
// 	twiml.message("Thanks for the text");
// 	res.writeHead(200, {'Content-Type': 'text/xml'})
// 	res.end(twiml.toString());
// })

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));


app.get('/', function(req, res) {
	res.render("index");
});

app.all('/call', function callWraper(req, res, next) {
	twCall(keyIn.number, res);
});
app.all('/text', function textWraper(req, res, next) {
	twText(keyIn.number, res);
});

// this is the route that Twilio's server pings to send us the text from the phone user
app.get('/chatresponse', function chatWraper(req, res, next){
	// configuring Twilio response from user texting my Twilio number
	// var resp = new twilio.TwimlResponse();

	// resp.say('Welcome to Twilio!');
	// resp.say('Please let us know if we can help during your development.', {
	// 	voice:'woman',
	// 	language:'en-gb'
	// });

	// console.log(resp.toString());
	// // var texts = twTextRec();
	// // res.json(texts);
	// res.send(resp);
	http.createServer(function (req, res) {
		var twiml = new twilio.TwimlResponse();
		twiml.message("Thanks for the text");
		res.writeHead(200, {'Content-Type': 'text/xml'})
		console.log(twiml);
		res.end(twiml.toString());
	})
})
app.listen(process.env.PORT || 3000, function() {
	console.log("twilioChat is running on port 3000");
});

