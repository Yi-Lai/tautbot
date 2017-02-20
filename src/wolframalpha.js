'use strict';

const Botkit = require('botkit');
const apiai = require('apiai');
const http = require('http');
const request = require('request');
const prompt = require('prompt');

var wolframalpha = "http://api.wolframalpha.com/v1/simple?appid=UX3QU2-76QKEYJJPG&i=";

constroller.hears(['direct_mention'], function (bot, message) {
var query = message.match[1];
request(`wolframalpha${query}`, function(err, result) {
        if (err) {
            console.log("Error", err);
        } else  if (result.body ==="Wolfram|Alpha did not understand your input") {
            bot.replyWithTyping(message, ":sad_face:")
        } else if (result.body === "No short answer available") {
            bot.replyWithTyping(message, ":thinking_face:")
        } else {
            bot.replyWithTyping(message, result.body);
        }
})
})
