
var express = require('express');
var router = express.Router();
var REQUEST = require('request');

var request = REQUEST.defaults( {
    strictSSL: false
});

var OPENWEATHERURL = "http://api.openweathermap.org/data/2.5/weather?appid=6b7b471967dd0851d0010cdecf28f829&units=metric";

exports.getWeather = function(req, res) {
	var city = req.query.city;
	if( (city === null) || (typeof(city) === 'undefined') ) {
		return res.status(400).send({msg:'city missing'});
	}

	var aurl = OPENWEATHERURL + '&q=' + city + ',nz';

	request({
		method: 'GET',
        url: aurl,
  		json: true
    }, function(err, resp, body) {
    	if(err) {
    		res.status(400).send('Failed to get the data');
    		//console.error("Failed to send request to openweathermap.org", err);
    	} else {
    		if(body.cod === 200) {
				var weath = "Conditions are " + body.weather[0].main + " and temperature is " + body.main.temp + ' C';
				var id = body.id;
				var response = {
					name: body.name,
					id: id,
					weather: weath
				};
    			return res.status(200).send(response);
    		} else {
                return res.status(400).send({msg:'Failed'});
            }
    	}
    });

};
router.get('/getWeather', exports.getWeather);

exports.getWeatherByCoordinates = function(req, res) {
	var lat = req.query.lat;
	var lon = req.query.lon;

	if(lat === null || lon === null || typeof(lat) === 'undefined' || typeof(lon) === 'undefined'){
		return res.status(400).send({msg:'coordinates missing'});
	}

	var aurl = OPENWEATHERURL + '&lat='+lat+'&lon='+lon;

	request({
		method: 'GET',
        url: aurl,
  		json: true
    }, function(err, resp, body) {
    	if(err) {
    		res.status(400).send('Failed to get the data');
    		//console.error("Failed to send request to openweathermap.org", err);
    	} else {
    		if(body.cod === 200) {
				var name = body.name;
				var weath = "Conditions are " + body.weather[0].main + " and temperature is " + body.main.temp + ' C';
				var id = body.id;
				var response = {
					name: name,
					weather: weath,
					id: id
				};
    			return res.status(200).send(response);
    		} else {
                return res.status(400).send({msg:'Failed'});
            }
    	}
    });

};
router.get('/getWeatherByCoordinates', exports.getWeatherByCoordinates);


exports.router = router;
