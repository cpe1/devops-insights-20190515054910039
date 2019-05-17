
var express = require('express');
var router = express.Router();
var REQUEST = require('request');

var request = REQUEST.defaults( {
    strictSSL: false
});

var OPENWEATHERURL = "http://api.openweathermap.org/data/2.5/weather?appid=6b7b471967dd0851d0010cdecf28f829&units=metric";

/*
	connect to the database
*/

//get the credentials from ibm cloud
var db2id = {
	"hostname": "dashdb-txn-sbox-yp-dal09-03.services.dal.bluemix.net",
	"password": "fbjvdr-lmlzvwtmk",
	"https_url": "https://dashdb-txn-sbox-yp-dal09-03.services.dal.bluemix.net",
	"port": 50000,
	"ssldsn": "DATABASE=BLUDB;HOSTNAME=dashdb-txn-sbox-yp-dal09-03.services.dal.bluemix.net;PORT=50001;PROTOCOL=TCPIP;UID=mbv31878;PWD=fbjvdr-lmlzvwtmk;Security=SSL;",
	"host": "dashdb-txn-sbox-yp-dal09-03.services.dal.bluemix.net",
	"jdbcurl": "jdbc:db2://dashdb-txn-sbox-yp-dal09-03.services.dal.bluemix.net:50000/BLUDB",
	"uri": "db2://mbv31878:fbjvdr-lmlzvwtmk@dashdb-txn-sbox-yp-dal09-03.services.dal.bluemix.net:50000/BLUDB",
	"db": "BLUDB",
	"dsn": "DATABASE=BLUDB;HOSTNAME=dashdb-txn-sbox-yp-dal09-03.services.dal.bluemix.net;PORT=50000;PROTOCOL=TCPIP;UID=mbv31878;PWD=fbjvdr-lmlzvwtmk;",
	"username": "mbv31878",
	"ssljdbcurl": "jdbc:db2://dashdb-txn-sbox-yp-dal09-03.services.dal.bluemix.net:50001/BLUDB:sslConnection=true;"
  };
var api = '/dbapi/v3';
var host = db2id['https_url']+ api;



var service;
var access_token;
var jobid;
var auth_header;


//GET - Get results from a SQL request
//POST - Request an Access token, or issue an SQL command

//host - this is the IP address of the machine that is hosting DB2 on Cloud
//api - The API library that is being used to communicate with DB2 on Cloud
//service - The service (API) that is being requested
	// - /auth/tokens - Requests an authentication token
	// - /sql_jobs - Submits an SQL request
	// - /sql_jobs/job# - Requests the results from an SQL request


/*
	Generating an access token
*/
exports.generateAccessToken = function(req,res) {
	var userinfo = {
		"userid": db2id['username'],
		  "password": db2id['password']
	};
	
	service = '/auth/tokens'

	request({
        url: host + service,
  		method: 'POST',
  		json: true,
    	body: userinfo
    }, function(err, resp, body) {
    	if(err) {
    		res.status(400).send('failed to get the data');
    	} else{
			if(body.cod == 200){
				//if successful we will receive a userid and token
				access_token = body.token;

				var response = {
					token: access_token
				};
				return res.status(200).send(response);
			}else{
				return res.status(400).send({msg:'Failed'});
			}
			
    	}
    });   
};
router.get('/generateAccessToken', exports.generateAccessToken);

/*
	Executing SQL Statements

	{
		"commands": "sql", //the SQL script to be executed (could be multiple statements) 
		"limit": x, //Max number of rows that will be fetched for each result set
		"separator": ";", //SQL statements terminator. A character that is used to mark the end of a SQL statement
		"stop_on_error": "yes"
	}
*/
exports.executeSQLStatement = function(req, res) {
	var city = req.query.city;

	//check we have received a value for the name
	if( (city === null) || (typeof(city) === 'undefined') ) {
		return res.status(400).send('city missing');
	}

	auth_header = {
		"Authorization": "Bearer " + access_token
	};

	var sql = "insert into Location (city) values ('"+city+"')";
	
	var sql_command = {
		"commands": sql,
		"limit": 1000, 
		"separator": ";",
		"stop_on_error": "yes"
	};

	service = '/sql_jobs';
	
	
	request({
        url: host + service,
  		method: 'POST',
  		json: true,
    	body: sql_command,
    	headers: auth_header
    }, function(err, resp, body) {
    	if(err){
    		res.status(400).send('connect fail');
    	} else{
			if(body.cod == 200){
				//set the value of the job id
				jobid = body.id;
				//var response = {
				//	id: jobid
				//}
				//get the answer set for this job
				return retrieveAnswerSet(res);
				//return res.status(200).send(response);
			}else{
				return res.status(400).send({msg:'Failed'});
			}
    	}
    });   
};
router.get('/executeSQLStatement', exports.executeSQLStatement);

/*
	Retrievng an Answer Set
*/
var retrieveAnswerSet = function(res){
	request({
        url: host + service + "/" + jobid,
        method: 'GET',
        json: true,
  		headers: auth_header
    }, function(err, resp, body) {
    	if(err) {
    		res.status(400).send('retrieve fail');
    	} else {
			if(body.cod == 200){
    			return res.status(200).send(body);
			}else{
				return res.status(400).send({msg:'Failed'});
			}
    	}
    });
	
};

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
				var response = {
					name: body.name,
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
				var response = {
					name: name,
					weather: weath
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
