
(function () {

    'use strict';

    var apiv1 = require('../../routes/apiv1');
    var assert = require('chai').assert;
    var REQUEST = require('request');

    var request = REQUEST.defaults( {
        strictSSL: false
    });

    var appUrl = process.env.APP_URL;

    describe('Get Weather', function() {

    	it('with valid city name', function(done) {
        if(!appUrl) {
            assert.fail("Environment variable APP_URL is not defined");
            return done();
        }
        request({
      		method: 'GET',
              url: appUrl + '/api/v1/getWeather?city=Hamilton'
          }, function(err, resp, body) {
          	if(err) {
          		assert.fail('Failed to get the response');
          	} else {
              assert.equal(resp.statusCode, 200);
              var pbody = JSON.parse(body);
              assert(pbody.name === 'Hamilton', "City name does not match");
              done();
            }
        });
    	});

      it('without city name', function(done) {
        if(!appUrl) {
            assert.fail("Environment variable APP_URL is not defined");
            return done();
        }
        request({
      		method: 'GET',
              url: appUrl + '/api/v1/getWeather'
          }, /* @callback */ function(err, resp, body) {
          	if(err) {
          		assert.fail('Failed to get the response');
          	} else {
              assert.equal(resp.statusCode, 400);
              done();
            }
        });
        });

      it('with another valid city name', function(done) {
        if(!appUrl) {
            assert.fail("Environment variable APP_URL is not defined");
            return done();
        }
        request({
      		method: 'GET',
              url: appUrl + '/api/v1/getWeather?city=Auckland'
          }, function(err, resp, body) {
          	if(err) {
          		assert.fail('Failed to get the response');
          	} else {
              assert.equal(resp.statusCode, 200);
              var pbody = JSON.parse(body);
              assert(pbody.name === 'Auckland', "City name does not match");
              done();
            }
        });
    	});
    });

    
    describe('Get Weather By Coordinates', function() {

        //for Hamilton the lat and lon are: "lon":175.28,"lat":-37.79
        it('with valid lat and lon', function(done) {
            if(!appUrl) {
                assert.fail("Environment variable APP_URL is not defined");
                return done();
            }
            request({
                  method: 'GET',
                  url: appUrl + '/api/v1/getWeatherByCoordinates?lon=175.28&lat=-37.79'
              }, function(err, resp, body) {
                  if(err) {
                      assert.fail('Failed to get the response');
                  } else {
                  assert.equal(resp.statusCode, 200);
                  var pbody = JSON.parse(body);
                  assert(pbody.name === 'Hamilton', "City name does not match");
                  done();
                }
            });
        });

        it('without lat and lon', function(done) {
            if(!appUrl) {
                assert.fail("Environment variable APP_URL is not defined");
                return done();
            }
            request({
                  method: 'GET',
                  url: appUrl + '/api/v1/getWeatherByCoordinates'
              }, /* @callback */ function(err, resp, body) {
                  if(err) {
                      assert.fail('Failed to get the response');
                  } else {
                  assert.equal(resp.statusCode, 400);
                  done();
                }
            });
        });

        //coordinates for auckland are: {"lon":174.77,"lat":-36.85} 
        //ID for auckland is: {"id":2193733}
        it('with another valid lat and lon', function(done) {
            if(!appUrl) {
                assert.fail("Environment variable APP_URL is not defined");
                return done();
            }
            request({
                  method: 'GET',
                  url: appUrl + '/api/v1/getWeatherByCoordinates?lat=-36.85&lon=174.77'
              }, function(err, resp, body) {
                  if(err) {
                      assert.fail('Failed to get the response');
                  } else {
                  assert.equal(resp.statusCode, 200);
                  var pbody = JSON.parse(body);
                  assert(pbody.name === 'Auckland', "City name does not match");
                  done();
                }
            });
        });



    });
})();
