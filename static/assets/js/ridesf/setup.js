/*
 *  application.js - Runs on DOM ready
 */
$(function() {

    DEFAULT_LATITUDE = 37.790777;
    DEFAULT_LONGITUDE = -122.393235;

    window.radius = 200;

    var mapOptions = {
        center: new google.maps.LatLng(DEFAULT_LATITUDE, DEFAULT_LONGITUDE),
        zoom: 16
    };

    fv = new FilterView({ el: $("#filter-box")});

    window.map = new google.maps.Map(document.getElementById("map-canvas"),
        mapOptions);

    window.directionsDisplay = new google.maps.DirectionsRenderer();
    window.directionsService = new google.maps.DirectionsService();

    window.locations = new ParkingLocations();

    window.markers = [];

    window.App.updateMap();

    $(".btn-nodirections").hide();
    $(".btn-nodirections").click(function() {
        window.App.closeDirections();
    });

    window.pos = {
        coords: {
            latitude: DEFAULT_LATITUDE,
            longitude: DEFAULT_LONGITUDE
        }
    }
});
