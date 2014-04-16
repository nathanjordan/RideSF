lat = null;
lon = null;


var contentString = "Hi!";

var infowindow = new google.maps.InfoWindow({
    content: contentString
});

Location = Backbone.Model.extend({
    urlRoot: '/location'
});

ParkingLocations = Backbone.Collection.extend({
    url: '/locations',
    model: Location,
    parse: function(data) {
        return data.results
    },
});
google.maps.event.addDomListener(window, 'load', initialize);

function initialize() {
    var mapOptions = {
        center: new google.maps.LatLng(37.790777,-122.393235),
        zoom: 17
    };
    var map = new google.maps.Map(document.getElementById("map-canvas"),
        mapOptions);
    moveMap = function(pos) {
        map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
        locations = new ParkingLocations();
        locations.fetch({
            data: $.param({lat: 37.790777, lon: -122.393235, meters: 300}),
            success: function(collection, response) {
                _.each(collection.models, function(model) {
                    var marker = new google.maps.Marker({
                        position: new google.maps.LatLng(model.get('location').coordinates[1], model.get('location').coordinates[0]),
                        map: map,
                        title:"hi"
                    });
                    google.maps.event.addListener(marker, 'click', function() {
                        infowindow.open(map, marker);
                    });
                });
            }
        });
    }
    navigator.geolocation.getCurrentPosition(moveMap);
    }

