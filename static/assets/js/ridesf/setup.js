/*
 *  application.js - Runs on DOM ready
 */
$(function() {

    DEFAULT_LATITUDE = 37.790777;
    DEFAULT_LONGITUDE = -122.393235;

    window.radius = 0;

    var mapOptions = {
        center: new google.maps.LatLng(DEFAULT_LATITUDE, DEFAULT_LONGITUDE),
        zoom: 16
    };

    window.map = new google.maps.Map(document.getElementById("map-canvas"),
        mapOptions);

    window.directionsDisplay = new google.maps.DirectionsRenderer();
    window.directionsService = new google.maps.DirectionsService();
    directionsDisplay.setMap(map);

    window.locations = new ParkingLocations();

    navigator.geolocation.getCurrentPosition(window.App.updatePosition);

    window.pos = {
        coords: {
            latitude: DEFAULT_LATITUDE,
            longitude: DEFAULT_LONGITUDE
        }
    }
});
