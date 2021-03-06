App = (function() {

    // constructor
    var App = function() {};

    App.prototype = {

        constructor: App,

        /*
         *   Initializes the application
         */
        initialize: function() {

            // Default Position (Near Uber Offices)
            DEFAULT_LATITUDE = 37.790777;
            DEFAULT_LONGITUDE = -122.393235;

            // Initialize the locations collection
            window.locations = new ParkingLocations();

            // Default radius is 200m
            window.radius = 200;

            // Map marker lists
            window.markers = [];
            window.infoWindows = [];

            // Initialize the Filter View in the right place
            fv = new FilterView({ el: $("#filter-box")});

            // When the user clicks the 'Close Directions' button
            // TODO: This should be replaced by a MapsView I think
            $(".btn-nodirections").click(function() {
                window.App.closeDirections();
            });

            // Create the default position for the map
            window.pos = {
                coords: {
                    latitude: DEFAULT_LATITUDE,
                    longitude: DEFAULT_LONGITUDE
                }
            }

            // Initialize the map
            window.App.initializeMap();

            // Update the map with current geolocation
            window.App.updateMap();
        },

        /*
         *   Initializes the map with custom styles and sets defaults
         */
        initializeMap: function() {

            // Style the map with a reddish hue
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

            // create map options
            var mapOptions = {
                center: new google.maps.LatLng(DEFAULT_LATITUDE, DEFAULT_LONGITUDE),
                zoom: 16,
                mapTypeControlOptions: {
                      mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
                    }
            };

            // create the map
            window.map = new google.maps.Map(document.getElementById("map-canvas"),
                mapOptions);

            // set the styles
            window.map.mapTypes.set('map_style', styledMap);
            window.map.setMapTypeId('map_style');

            // style the direction line
            var polylineOptions = new google.maps.Polyline({
                strokeColor: '#556270',
                strokeOpacity: 0.9,
                strokeWeight: 12
                });

            // create entities for directions
            window.directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true, polylineOptions: polylineOptions});
            window.directionsService = new google.maps.DirectionsService();
        },

        /*
         *   Updates the map with the users current geolocation
         */
        updateMap: function() {
            // Clear the markers
            window.App.clearMarkers();

            // Get our current position
            navigator.geolocation.getCurrentPosition(
                window.App.handlePosition,
                window.App.handlePositionError,
                {
                    enableHighAccurary: true,
                    timeout: 5000
                }
            );
        },

        /*
         *   Handles the event where a geolocation cannot be acquired
         */
        handlePositionError: function(err) {
            // Make a javascript alert (gross!)
            // TODO: Make this a bootstrap alert
            alert(err.message)
        },

        /*
         *   Handles when the user clicks on 'Directions' on the map
         */
        handleDirectionClick: function(element) {
            var element = $(element);
            var latitude = parseFloat(element.attr("data-latitude"));
            var longitude = parseFloat(element.attr("data-longitude"));
            // Request directions
            window.App.getDirections({loc: {coordinates: [longitude, latitude]}});
        },

        /*
         *   Handles when geolocation is acquired
         */
        handlePosition: function(pos) {
            window.pos = pos;

            //center the map on the new position
            window.App.centerMap();

            // get the parking locations
            window.App.fetchMarkers();
        },

        /*
         *   Centers the map on the window.pos coordinates
         */
        centerMap: function() {
            // create the center marker
            window.App.generateCenterMarker(window.pos.coords.latitude, window.pos.coords.longitude);
            // set the map to center on that point and set the zoom
            window.map.setCenter(new google.maps.LatLng(window.pos.coords.latitude,
                                                      window.pos.coords.longitude));
            window.map.setZoom(16);
        },

        /*
         *   Gets the bike parking around the current location
         */
        fetchMarkers:function() {
            // fetch from the locations collection
            window.locations.fetch({
                // give the server the location and radius to search
                data: $.param({lat: window.pos.coords.latitude,
                               lon: window.pos.coords.longitude,
                               radius: window.radius}),
                success: function(collection, response) {
                    // generate the markers from the new collection
                    _.each(collection.models, function(model) {
                        window.App.generateMarker(model);
                    });
                }
            });
        },

        /*
         *   Displays directions to the selected marker
         */
        getDirections: function (destination) {
            // make a directions request
            var request = {
                origin: window.pos.coords.latitude + ', ' + window.pos.coords.longitude,
                destination: destination.loc.coordinates[1] + ', ' + destination.loc.coordinates[0],
                travelMode: google.maps.TravelMode.BICYCLING
            };

            // kindly ask google maps to route them
            window.directionsService.route(request, function(result, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    // Show directions
                    window.directionsDisplay.setMap(map);
                    window.directionsDisplay.setDirections(result);

                    // Show the 'close directions' button
                    $(".btn-nodirections").show();

                    //close all the infowindows
                    window.App.closeInfoWindows();
                } else {
                    // TODO: Display some kind of bootstrap alert
                }
            });
        },

        /*
         *   Creates a center marker where the users current position is
         */
        generateCenterMarker: function(latitude, longitude) {
            // create a new marker
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(latitude, longitude),
                map: window.map,
                icon: '/assets/img/marker2.svg',
                animation: google.maps.Animation.DROP
            });

            // Reset the existing center marker
            if (window.centerMarker) {
                window.centerMarker.setMap(null);
            }

            // add it to the list and set the center marker
            window.markers.push(marker);
            window.centerMarker = marker;
        },

        /*
         *   Creates a marker at a given latitude and longitude
         */
        generateMarker: function(model) {
            var latitude = model.get('location').coordinates[1];
            var longitude = model.get('location').coordinates[0];
            var title = model.get('loc_name');
            // Render the tooltip using underscore templates
            var tooltip = _.template($("#map-tooltip-template").html(), {model: model, latitude: latitude, longitude: longitude});
            // Create the marker
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(latitude, longitude),
                map: window.map,
                icon: '/assets/img/marker.svg',
                animation: google.maps.Animation.DROP
            });

            // Add it to the marker list
            window.markers.push(marker);

            // Create an infowindow for the marker
            var infowindow = new google.maps.InfoWindow({
                content: tooltip
            });

            // Tell the map to open the infowindow when we click the marker
            google.maps.event.addListener(marker, 'click', function() {
                infowindow.open(window.map, marker);
            });

            // Add it to the infowindow list
            window.infoWindows.push(infowindow);
        },

        /*
         *  Clears markers from the map
         */
        clearMarkers: function () {
            // Clear the markers from the map
            _.each(window.markers, function(marker) {
                marker.setMap(null);
            });

            // Close all the infowindows
            _.each(window.infoWindows, function(infoWindow) {
                infoWindow.close();
            });

            // Truncate the lists
            window.markers.splice(0, window.markers.length);
            window.infoWindows.splice(0, window.infoWindows.length);
        },

        /*
         *   Removes directions from the map
         */
        closeDirections: function() {
            // Clear the directions
            window.directionsDisplay.setMap(null)

            // Reset the zoom level
            window.map.setZoom(16);

            // hide that close directions button
            $(".btn-nodirections").hide();
        },

        /*
         * Close all the infoWindows above the markers
         */
        closeInfoWindows: function () {
            // close the infowindows
            _.each(window.infoWindows, function(infoWindow) {
                infoWindow.close();
            });
        }
    };

    return App;
})();

window.App = new App();
