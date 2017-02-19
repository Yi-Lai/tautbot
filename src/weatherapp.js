'use strict';

const http = require('http');
const request = require('request');
const prompt = require('prompt');

//secret key: fe7bfa5dd2a889de4ebca2d2368c5627
var darkSkyURL = "https://api.darksky.net/forecast/fe7bfa5dd2a889de4ebca2d2368c5627/";
var googleURL = "https://maps.googleapis.com/maps/api/geocode/json?address=";

prompt.get(['location'], function(err, result) {

    console.log('Command-line input received:');
    console.log('Enter your location: ' result.location);

    googleURL = googleURL result.location;

    request(googleURL, function(err, response) {

        // Catch error from api call
        if (err) {
            console.log("Error calling googleURL", err);
        } else {
            try {
                var searchResults = JSON.parse(response.body)
                var lat1 = Math.round(searchResults.results[0].geometry.location.lat * 100) / 100;
                var lon1 = Math.round(searchResults.results[0].geometry.location.lng * 100) / 100;
            } catch (error) {
                console.log(error);
            }

        }

        darkSkyURL = darkSkyURL lat1 "," lon1;

        request(darkSkyURL, function(err, response) {

            if (err) {
                console.log("Error calling darkSkyURL", err);
            } else {
                try {
                    var weatherResults = JSON.parse(response.body)

                    var fiveDays = weatherResults.daily.data.slice(0, 5);
                } catch (error) {
                    console.log(error);
                }
            }
        });
    });
});
