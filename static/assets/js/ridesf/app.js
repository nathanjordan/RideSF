window.App = {
    initialize: function() {

        DEFAULT_LATITUDE = 37.790777;
        DEFAULT_LONGITUDE = -122.393235;

        window.locations = new ParkingLocations();
        window.radius = 200;
        window.markers = [];
        window.infoWindows = [];

        fv = new FilterView({ el: $("#filter-box")});

        $(".btn-nodirections").click(function() {
            window.App.closeDirections();
        });

        window.pos = {
            coords: {
                latitude: DEFAULT_LATITUDE,
                longitude: DEFAULT_LONGITUDE
            }
        }

        window.App.initializeMap();
        window.App.updateMap();
    },
    initializeMap: function() {

        var mapStyles = [
            {
                stylers: [{ hue: "#c44d58" }, { saturation: -10 }]
            },
            {
                featureType: "road",
                elementType: "geometry",
                stylers: [{lightness: 100}, {visibility: "simplified"}]
            }
        ];
        var styledMap = new google.maps.StyledMapType(mapStyles, {name: "RideSF"});
        var mapOptions = {
            center: new google.maps.LatLng(DEFAULT_LATITUDE, DEFAULT_LONGITUDE),
            zoom: 16,
            mapTypeControlOptions: {
                  mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
                }
        };
        window.map = new google.maps.Map(document.getElementById("map-canvas"),
            mapOptions);
        window.map.mapTypes.set('map_style', styledMap);
        window.map.setMapTypeId('map_style');
        var polylineOptions = new google.maps.Polyline({
            strokeColor: '#556270',
            strokeOpacity: 0.9,
            strokeWeight: 12
            });
        window.directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true, polylineOptions: polylineOptions});
        window.directionsService = new google.maps.DirectionsService();
    },
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
                $(".btn-nodirections").show();
                window.App.closeInfoWindows();
            }
        });
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
        window.infoWindows.push(infowindow);
    },
    clearMarkers: function () {
        _.each(window.markers, function(marker) {
            marker.setMap(null);
        });
        _.each(window.infoWindows, function(infoWindow) {
            infoWindow.close();
        });
        window.markers.splice(0, window.markers.length);
        window.infoWindows.splice(0, window.infoWindows.length);
    },
    closeDirections: function() {
        window.directionsDisplay.setMap(null)
        window.map.setZoom(16);
        $(".btn-nodirections").hide();
    },
    closeInfoWindows: function () {
        _.each(window.infoWindows, function(infoWindow) {
            infoWindow.close();
        });
    }
};
