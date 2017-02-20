// Module must be started with environment variables
//
//  accesskey="api.ai client access key"
//  slackkey="slack bot key"
//

'use strict';

const Botkit = require('botkit');

const apiai = require('apiai');
const uuid = require('node-uuid');
const http = require('http');
const Entities = require('html-entities').XmlEntities;
const decoder = new Entities();

const apiAiAccessToken = process.env.accesstoken;
const slackBotKey = process.env.slackkey;

const apiAiService = apiai(apiAiAccessToken);

var wolframalpha = "http://api.wolframalpha.com/v1/simple?appid=UX3QU2-76QKEYJJPG&i=";

const sessionIds = new Map();

const controller = Botkit.slackbot({
    debug: false
    //include "log: false" to disable logging
});

var bot = controller.spawn({
    token: slackBotKey
}).startRTM();

controller.on('rtm_close', function (bot, err) {
    console.log('** The RTM api just closed, reason', err);

    try {

        // sometimes connection closing, so, we should restart bot
        if (bot.doNotRestart != true) {
            let token = bot.config.token;
            console.log('Trying to restart bot ' + token);

            restartBot(bot);
        }

    } catch (err) {
        console.error('Restart bot failed', err);
    }
});

function restartBot(bot) {
    bot.startRTM(function (err) {
        if (err) {
            console.error('Error restarting bot to Slack:', err);
        }
        else {
            let token = bot.config.token;
            console.log('Restarted bot for %s', token);
        }
    });
}

function isDefined(obj) {
    if (typeof obj == 'undefined') {
        return false;
    }

    if (!obj) {
        return false;
    }

    return obj != null;
}

controller.hears(['direct_mention'], function (bot, message) {
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

controller.hears(['(.*)'], ['direct_message'], (bot, message) => {
    try {
        if (message.type == 'message') {
            if (message.user == bot.identity.id) {
                // message from bot can be skipped
            }
            else if (message.text.indexOf("<@U") == 0 && message.text.indexOf(bot.identity.id) == -1) {
                // skip other users direct mentions
            }
            else {
                bot.reply(message.toSay);
                let requestText = decoder.decode(message.text);
                requestText = requestText.replace("’", "'");

                let channel = message.channel;
                let messageType = message.event;
                let botId = '<@' + bot.identity.id + '>';
                let userId = message.user;

                console.log(requestText);
                console.log(messageType);

                if (requestText.indexOf(botId) > -1) {
                    requestText = requestText.replace(botId, '');
                }

                if (!sessionIds.has(channel)) {
                    sessionIds.set(channel, uuid.v1());
                }

                console.log('Start request ', requestText);
                let request = apiAiService.textRequest(requestText,
                    {
                        sessionId: sessionIds.get(channel),
                        contexts: [
                            {
                                name: "generic",
                                parameters: {
                                    slack_user_id: userId,
                                    slack_channel: channel
                                }
                            }
                        ]
                    });

                request.on('response', (response) => {
                    console.log(response);

                    if (isDefined(response.result)) {
                        let responseText = response.result.fulfillment.speech;
                        let responseData = response.result.fulfillment.data;

                        if (isDefined(responseData) && isDefined(responseData.slack)) {
                            replyWithData(bot, message, responseData);
                        } else if (isDefined(responseText)) {
                            replyWithText(bot, message, responseText);
                        }

                    }
                });

                request.on('error', (error) => console.error(error));
                request.end();
            }
        }
    } catch (err) {
        console.error(err);
    }
});

function replyWithText(bot, message, responseText) {
    bot.reply(message, responseText, (err, resp) => {
        if (err) {
            console.error(err);
        }
});
}

function replyWithData(bot, message, responseData) {
    try {
        bot.reply(message, responseData.slack);
    } catch (err) {
        bot.reply(message, err.message);
    }
}


//Create a server to prevent Heroku kills the bot
const server = http.createServer((req, res) => res.end());

//Lets start our server
server.listen((process.env.PORT || 5002), () => console.log("Server listening"));
