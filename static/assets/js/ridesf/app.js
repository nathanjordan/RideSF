window.App = {
    updatePosition: function(pos) {
        //TODO For Debugging
        //window.pos = pos;
        window.App.centerMap();
        window.App.fetchMarkers();
    },
    centerMap: function() {
        window.map.setCenter(new google.maps.LatLng(window.pos.coords.latitude,
                                                  window.pos.coords.longitude));
        window.map.setZoom(16);
    },
    fetchMarkers:function() {
        window.locations.fetch({
            data: $.param({lat: window.pos.coords.latitude,
                           lon: window.pos.coords.longitude,
                           radius: window.radius}),
            success: function(collection, response) {
                _.each(collection.models, function(model) {
                    var latitude = model.get('location').coordinates[1];
                    var longitude = model.get('location').coordinates[0];
                    var title = model.get('loc_name');
                    var tooltip = _.template($("#map-tooltip-template").html(), {model: model});
                    var marker = new google.maps.Marker({
                        position: new google.maps.LatLng(latitude, longitude),
                        map: window.map,
                        title: title
                    });
                    var infowindow = new google.maps.InfoWindow({
                        content: tooltip
                    });
                    google.maps.event.addListener(marker, 'click', function() {
                        infowindow.open(window.map, marker);
                    });
                });
            }
        });
    },
    getDirections: function (destination) {
        var request = {
            origin: window.pos.coords.latitude + ', ' + window.pos.coords.latitude,
            destination: destination.loc.coordinates[1] + ', ' + destination.loc.coordinates[1],
            travelMode: google.maps.TravelMode.DRIVING
        };
        window.directionsService.route(request, function(result, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                window.directionsDisplay.setDirections(result);
            }
        });
    }
};
