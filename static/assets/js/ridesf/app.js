window.App = {
    updateMap: function() {
        window.App.clearMarkers();
        navigator.geolocation.getCurrentPosition(
            window.App.handlePosition,
            window.App.handlePositionError,
            {
                enableHighAccurary: true,
                timeout: 5000
            }
        );
    },
    handlePositionError: function(err) {
        alert(error.message)
    },
    handleDirectionClick: function(e) {
        var latitude = parseFloat(e.attributes.getNamedItem("data-latitude").value);
        var longitude = parseFloat(e.attributes.getNamedItem("data-longitude").value);
        window.App.getDirections({loc: {coordinates: [longitude, latitude]}});
    },
    handlePosition: function(pos) {
        //TODO For Debugging
        //window.pos = pos;
        window.App.centerMap();
        window.App.fetchMarkers();
    },
    centerMap: function() {
        window.App.generateCenterMarker(window.pos.coords.latitude, window.pos.coords.longitude);
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
                    window.App.generateMarker(model);
                });
            }
        });
    },
    getDirections: function (destination) {
        var request = {
            origin: window.pos.coords.latitude + ', ' + window.pos.coords.longitude,
            destination: destination.loc.coordinates[1] + ', ' + destination.loc.coordinates[0],
            travelMode: google.maps.TravelMode.DRIVING
        };
        window.directionsService.route(request, function(result, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                window.directionsDisplay.setMap(map);
                window.directionsDisplay.setDirections(result);
            }
        });
        $(".btn-nodirections").show();
    },
    generateCenterMarker: function(latitude, longitude) {
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(latitude, longitude),
            map: window.map,
            icon: '/assets/img/marker2.svg',
            animation: google.maps.Animation.DROP
        });
        if (window.centerMarker) {
            window.centerMarker.setMap(null);
        }
        window.markers.push(marker);
        window.centerMarker = marker;
    },
    generateMarker: function(model) {
        var latitude = model.get('location').coordinates[1];
        var longitude = model.get('location').coordinates[0];
        var title = model.get('loc_name');
        var tooltip = _.template($("#map-tooltip-template").html(), {model: model, latitude: latitude, longitude: longitude});
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(latitude, longitude),
            map: window.map,
            icon: '/assets/img/marker.svg',
            animation: google.maps.Animation.DROP
        });
        window.markers.push(marker);
        var infowindow = new google.maps.InfoWindow({
            content: tooltip
        });
        google.maps.event.addListener(marker, 'click', function() {
            infowindow.open(window.map, marker);
        });
    },
    clearMarkers: function () {
        for (var i = 0; i < window.markers.length; i++) {
            var marker = window.markers[i];
            marker.setMap(null);
        }
        window.markers.splice(0, window.markers.length);
    },
    closeDirections: function() {
        window.directionsDisplay.setMap(null)
        window.map.setZoom(16);
        $(".btn-nodirections").hide();
    }
};
