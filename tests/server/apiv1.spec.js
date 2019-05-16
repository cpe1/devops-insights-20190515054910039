
(function () {

  'use strict';

	var requireHelper = require('./requireHelper');
  var apiv1 = requireHelper.require('tests/coverage/instrumented/routes/apiv1');
  var assert = require('chai').assert;
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
  sinon.spy(resMock, "status");
  sinon.spy(resMock, "send");


  describe('Get Weather', function() {

    it('with without city name', function() {
      reqMock = {
        query: {

        }
      };

      apiv1.getWeather(reqMock, resMock);

      assert(resMock.status.lastCall.calledWith(400), 'Unexpected status code:' + resMock.status.lastCall.args);
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

    it('with incomplete city name', function() {
      reqMock = {
        query: {
          city: 'Hamil'
        }
      };

      var request = function( obj, callback ){
        callback(null, null, {});
      };

      apiv1.__set__("request", request);

      apiv1.getWeather(reqMock, resMock);

      assert(resMock.status.lastCall.calledWith(400), 'Unexpected response:' + resMock.status.lastCall.args);
      assert(resMock.send.lastCall.args[0].msg === 'Failed', 'Unexpected response:' + resMock.send.lastCall.args);
    });

    it('with valid city name', function() {
      reqMock = {
        query: {
          city: 'Auckland'
        }
      };

      var body = {
        cod: 200,
        name: 'Auckland',
        weather: [
          {
            main: 'cold'
          }
        ],
        main: {
          temp: 20.12
        }
      };

      var request = function( obj, callback ){
        callback(null, null, body);
      };

      apiv1.__set__("request", request);

      apiv1.getWeather(reqMock, resMock);

      assert(resMock.status.lastCall.calledWith(200), 'Unexpected response:' + resMock.status.lastCall.args);
      assert(resMock.send.lastCall.args[0].name === 'Auckland', 'Unexpected response:' + resMock.send.lastCall.args[0].name);
      assert(resMock.send.lastCall.args[0].weather === 'Conditions are cold and temperature is 20.12 C', 'Unexpected response:' + resMock.send.lastCall.args[0].weather);
    });
  });  

//http://api.openweathermap.org/data/2.5/weather?appid=6b7b471967dd0851d0010cdecf28f829&units=metric&q=Hamilton,nz
  describe('Get Weather By Coordinates', function() {

    it('without coordinates', function() {
      reqMock = {
        query: {

        }
      };

      apiv1.getWeather(reqMock, resMock);

      assert(resMock.status.lastCall.calledWith(400), 'Unexpected status code:' + resMock.status.lastCall.args);
    });

    //Hamilton coordinates: {"lon":175.28,"lat":-37.79}
    it('with valid coordinates and error from request call', function() {
      reqMock = {
        query: {
          lat: '-37.79',
          lon: '175.28'
        }
      };

      var request = function( obj, callback ){
        callback("error", null, null);
      };

      apiv1.__set__("request", request);

      apiv1.getWeatherByCoordinates(reqMock, resMock);

      assert(resMock.status.lastCall.calledWith(400), 'Unexpected response:' + resMock.status.lastCall.args);
      assert(resMock.send.lastCall.calledWith('Failed to get the data'), 'Unexpected response:' + resMock.send.lastCall.args);
    });

    it('with incomplete coordinates', function(){
      reqMock = {
        query: {
          lat: " ",
          lon: " "
        }
      };

      var request = function( obj, callback ){
        callback(null, null, {});
      };

      apiv1.__set__("request", request);

      apiv1.getWeatherByCoordinates(reqMock, resMock);

      assert(resMock.status.lastCall.calledWith(400), 'Unexpected response:' + resMock.status.lastCall.args);
      assert(resMock.send.lastCall.args[0].msg === 'Failed', 'Unexpected response:' + resMock.send.lastCall.args);
    });

    it('with valid coordinates', function() {
      reqMock = {
        query: {
          lat: '-37.79',
          lon: '175.28'
        }
      };

      var body = {
        cod: 200,
        name: 'Hamilton',
        weather: [
          {
            main: 'cold'
          }
        ],
        main: {
          temp: 20.12
        }
      };

      var request = function( obj, callback ){
        callback(null, null, body);
      };

      apiv1.__set__("request", request);

      apiv1.getWeatherByCoordinates(reqMock, resMock);

      assert(resMock.status.lastCall.calledWith(200), 'Unexpected response:' + resMock.status.lastCall.args);
      assert(resMock.send.lastCall.args[0].name === 'Hamilton', 'Unexpected response:' + resMock.send.lastCall.args[0].name);
      assert(resMock.send.lastCall.args[0].weather === 'Conditions are cold and temperature is 20.12 C', 'Unexpected response:' + resMock.send.lastCall.args[0].weather);
    });

  });  

}());
