//declare variables
var geocoder;
var map;
var markers;
var bounds;

/*
    a function to initialise some of the components
*/
var initilise = function(){
    geocoder = new google.maps.Geocoder();
    markers = [4];
    bounds = new google.maps.LatLngBounds();
    initMarkers();
    
};

var ConsoleModule = angular.module('ConsoleModule', ['ngRoute']);

ConsoleModule.config(['$routeProvider', '$locationProvider','$sceDelegateProvider', '$httpProvider',
    function ($routeProvider, $locationProvider, $sceDelegateProvider, $httpProvider) {
    $routeProvider.when('/', {
        templateUrl: '/partials/Byzip.html',
        controller: 'wcontroller',
        controllerAs: 'wcontroller'
    });
}]);

ConsoleModule.controller('wcontroller', ['$scope', '$http', '$routeParams', '$timeout', '$sce',
    function($scope, $http, $routeParams, $timeout, $sce) {
    google.maps.event.addListener(map,'click',function(event) {                
        $http({
            method: "GET",
            url: '/api/v1/getWeatherByCoordinates?lat=' + event.latLng.lat() + '&lon=' +event.latLng.lng()
        }).then( function(response) {
            var name = response.data.name;
            var weather = response.data.weather;
            var clickweather = document.getElementById('clickweather');

            clickweather.innerHTML = 'The weather in '+name + ': ' + weather;
        });
    });
    $scope.somemessage = "Some NZ weather";
    $scope.city1Weather = "";
    
    $scope.city = function(which) {

        var data = "";
        if(which === 1) {
            data = $scope.city1m;      
        } else if(which === 2) {
            data = $scope.city2m;
        } else if(which === 3) {
            data = $scope.city3m;
        } else if(which === 4) {
            data = $scope.city4m;
        } 
            $http({
                method: "GET",
                url: '/api/v1/getWeather?city=' + data
            }).then( function(response) {
                if(which === 1) {
                    $scope.city1Weather = response.data.weather;
                    citySearch($scope.city1m, 0);
                } else if(which === 2) {
                    $scope.city2Weather = response.data.weather;
                    citySearch($scope.city2m, 1);
                } else if(which === 3) {
                    $scope.city3Weather = response.data.weather;
                    citySearch($scope.city3m, 2);
                } else if(which === 4) {
                    $scope.city4Weather = response.data.weather;
                    citySearch($scope.city4m, 3);
                } 
            });
            if(which === 1) {
                $scope.city1Weather = "";
            } else if(which === 2) {
                $scope.city2Weather = "";
            } else if(which === 3) {
                $scope.city3Weather = "";
            } else if(which === 4) {
                $scope.city4Weather = "";
            } 
    };    
}]);
    
/*
    a function that iterates through the list of markers and displays them all on the map, it also
    creates the bounds to move the map around the bounds.

function placeMarkers(){
    var i;
    for( i = 0; i < markers.length; i++ ) {
        if(markers[i] != null){
            bounds.extend(markers[i]);
            marker = new google.maps.Marker({
                position: markers[i],
                map: map
            });
        }else{
            
        }
    }
    //center the map around the bounds of the locations
    map.fitBounds(bounds);
}
*/


function initMarkers(){
    var marker1 = new google.maps.Marker({
        map: map
    });

    var marker2 = new google.maps.Marker({
        map: map
    });

    var marker3 = new google.maps.Marker({
        map: map
    });

    var marker4 = new google.maps.Marker({
        map: map
    });

    markers[0] = marker1;
    markers[1] = marker2;
    markers[2] = marker3;
    markers[3] = marker4;
}

function changeMarkerPosition(marker, location) {
    marker.setPosition(location);
}

/*
    a function which takes a city name as a parameter and gets the lat and lng coordinates
    from google maps, adds it to a list and calls another function to display all of the markers
*/
function citySearch(city, pos) {
    var location;
    var address = city; //the address we want to search for is the town name
    geocoder.geocode({ 
        'address': address, 
        'componentRestrictions':{
            'country':'NZ' //restrict the search to be only in new zealand
        }
    }, function(results, status){ //when we get the results
            if (status === 'OK') { //the request was successful                
               location = results[0].geometry.location;
            
                //update its location
                markers[pos].setPosition(location);

            }else{
                if(status=='ZERO_RESULTS'){ //we didnt get any match for our town search
                    alert("There were no results for your search!"); //alert the user there were no results
                }else{
                    alert('Your search failed: ' + status); //if it was something else alert the user with that
                }
            }
        });
}
