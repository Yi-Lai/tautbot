'use strict';

const http = require('http');
const request = require('request');
const prompt = require('prompt');

var wolframalpha = "http://api.wolframalpha.com/v1/simple?appid=UX3QU2-76QKEYJJPG&i=";


prompt.get(['input'], function(err, result) {

    console.log('Command-line input received:');
    console.log('Enter your information: '+ result.location);

    wolframalpha = wolframalpha + result.input;

    request(wolframalpha, function(err, response) {

        // Catch error from api call
        if (err) {
            console.log("Error calling wolframalpha", err);
        } else {
            try {
                var searchResults = JSON.parse(response.body)
            } catch (error) {
                console.log(error);
            }

        }
})
})
