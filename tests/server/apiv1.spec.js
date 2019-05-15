
(function () {

  'use strict';

	var requireHelper = require('./requireHelper');
  var apiv1 = requireHelper.require('tests/coverage/instrumented/routes/apiv1');

  //chai is an assertions library
  var assert = require('chai').assert;

  //sinon is a library of test doubles
  var sinon = require('sinon');



  // create mock request and response
  var reqMock = {};

  var resMock = {};
  resMock.status = function() {
    return this;
  };
  resMock.send = function() {
    return this;
  };
  resMock.end = function() {
    return this;
  };

  //There are several types of test doubles:
  //A spy wraps a real function in order to record information about it, 
  //like how many times it was called and with what arguments.
  sinon.spy(resMock, "status");
  sinon.spy(resMock, "send");


  //The `it` call identifies each individual tests but by itself
  // it does not tell Mocha anything about how your test suite 
  //is structured. How you use the `describe` call is what gives 
  //structure to your test suite. 
  describe('Get Weather', function() {

    it('with valid city name', function() {
      reqMock = {
        query: {
          city: 'Hamilton'
        }
      };

      var body = {
        cod: 200,
        weather: [
          {
            main: 'clear'
          }
        ],
        main: {
          temp: 20
        }
      };

      var request = function( obj, callback ){
        callback(null, null, body);
      };

      apiv1.__set__("request", request);

      apiv1.getWeather2(reqMock, resMock);

      assert(resMock.status.lastCall.calledWith(200), 'Unexpected response:' + resMock.status.lastCall.args);
      assert(resMock.send.lastCall.args[0].weather === 'Conditions are clear and temperature is 20 C', 'Unexpected response:' + resMock.send.lastCall.args[0].weather);
    });

    it('without city name', function(){
      //create a request with an empty query
      reqMock = {
        query: {

        }
      }

      //generate the request and get the response
      apiv1.getWeather(reqMock, resMock);

      //we should receive a 400 status back
      assert(resMock.status.lastCall.calledWith(400), 'Unexpected status code: ' + resMock.status.lastCall.args);
    });

    it('with valid city name and error from request call', function() {
      reqMock = {
        query: {
          city: 'Hamilton'
        }
      };

      var request = function( obj, callback ){
        callback("error", null, null);
      };

      apiv1.__set__("request", request);

      apiv1.getWeather(reqMock, resMock);

      assert(resMock.status.lastCall.calledWith(400), 'Unexpected response:' + resMock.status.lastCall.args);
      assert(resMock.send.lastCall.calledWith('Failed to get the data'), 'Unexpected response:' + resMock.send.lastCall.args);
    });


  });



  /*
  describe('Get Weather 2', function() {

    it('with without zip code', function() {
      reqMock = {
        query: {

        }
      };

      apiv1.getWeather2(reqMock, resMock);

      assert(resMock.status.lastCall.calledWith(400), 'Unexpected status code:' + resMock.status.lastCall.args);
    });

    it('with valid zip code and error from request call', function() {
      reqMock = {
        query: {
          zip: 79968
        }
      };

      var request = function( obj, callback ){
        callback("error", null, null);
      };

      apiv1.__set__("request", request);

      apiv1.getWeather2(reqMock, resMock);

      assert(resMock.status.lastCall.calledWith(400), 'Unexpected response:' + resMock.status.lastCall.args);
      assert(resMock.send.lastCall.calledWith('Failed to get the data'), 'Unexpected response:' + resMock.send.lastCall.args);
    });

    it('with incomplete zip code', function() {
      reqMock = {
        query: {
          zip: 79968
        }
      };

      var request = function( obj, callback ){
        callback(null, null, {});
      };

      apiv1.__set__("request", request);

      apiv1.getWeather2(reqMock, resMock);

      assert(resMock.status.lastCall.calledWith(400), 'Unexpected response:' + resMock.status.lastCall.args);
      assert(resMock.send.lastCall.args[0].msg === 'Failed', 'Unexpected response:' + resMock.send.lastCall.args);
    });

    it('with valid zip code', function() {
      reqMock = {
        query: {
          zip: 79968
        }
      };

      var body = {
        cod: 200,
        name: 'El Paso',
        weather: [
          {
            main: 'cold'
          }
        ],
        main: {
          temp: 78
        }
      };

      var request = function( obj, callback ){
        callback(null, null, body);
      };

      apiv1.__set__("request", request);

      apiv1.getWeather2(reqMock, resMock);

      assert(resMock.status.lastCall.calledWith(200), 'Unexpected response:' + resMock.status.lastCall.args);
      assert(resMock.send.lastCall.args[0].city === 'El Paso', 'Unexpected response:' + resMock.send.lastCall.args[0].city);
      assert(resMock.send.lastCall.args[0].weather === 'Conditions are cold and temperature is 78 F', 'Unexpected response:' + resMock.send.lastCall.args[0].weather);
    });
  });
  */
}());
