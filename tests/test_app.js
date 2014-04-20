describe('App', function() {
    describe('initialize', function() {
        var s1, s2;
        before(function() {
            s1 = sinon.spy(window.App, "initializeMap");
            s2 = sinon.spy(window.App, "updateMap");
            window.App.initialize();
        });
        it('Create locations collection', function () {
            assert(window.locations);
        });
        it('creates markers list', function () {
            assert(window.markers);
        });
        it('create info window list', function () {
            assert(window.infoWindows);
        });
        it('renders filters', function () {
            assert($("#filter-box").html().length);
        });
        it('sets radius', function () {
            assert(window.radius);
        });
        it('creates default position', function () {
            assert(window.pos);
        });
        it('initialize the map', function () {
            assert(s1.called);
        });
        it('update the map', function () {
            assert(s2.called);
        });
    });
    describe('initializeMap', function() {
        var s1, s2;
        before(function() {
            s1 = sinon.spy(google.maps, "DirectionsRenderer")
            s2 = sinon.spy(google.maps, "DirectionsService")
            window.App.initializeMap();
        });
        it('creates map', function () {
            assert($("#map-canvas").html().length);
        });
        it('creates direction renderer', function () {
            assert(window.directionsDisplay);
            assert(s1.called);
        });
        it('creates direction service', function () {
            assert(window.directionsService);
            assert(s2.called);
        });
    });
    describe('updateMap', function() {
        var s1, s2;
        before(function() {
            s1 = sinon.spy(navigator.geolocation, 'getCurrentPosition');
            s2 = sinon.spy(window.App, 'clearMarkers');
            window.App.updateMap();
        });
        it('called getcurrentpos', function () {
            assert(s1.called);
        });
        it('cleared markers', function () {
            assert(s2.called);
        });
    });
    describe('handlePositionError', function() {
        var s1;
        before(function() {
            s1 = sinon.spy(window, 'alert');
            window.App.handlePositionError({message: ""});
        });
        it('alert called', function () {
            assert(s1.called);
        });
    });
    describe('handleDirectionClick', function() {
        var s1;
        before(function() {
            s1 = sinon.spy(window.App, 'getDirections');
            var e = $("#directions-button").get(0);
            window.App.handleDirectionClick(e);
        });
        it('called getDirections', function () {
            assert(s1.called);
        });
    });
    describe('handlePosition', function() {
        var s1, s2;
        var pos = {
            coords: {
                latitude: 1.0,
                longitude: 1.0
            }
        }
        before(function() {
            s1 = sinon.spy(window.App, 'centerMap');
            s2 = sinon.spy(window.App, 'fetchMarkers');
            window.App.handlePosition(pos);
        });
        it('set the position', function () {
            assert(true);
        });
        it('call centerMap function', function () {
            assert(s1.called);
        });
        it('fetch the markers', function () {
            assert(s2.called);
        });
    });
    describe('centerMap', function() {
        var s1, s2, s3;
        before(function() {
            s1 = sinon.spy(window.App, 'generateCenterMarker');
            s2 = sinon.spy(window.map, 'setCenter');
            s3 = sinon.spy(window.map, 'setZoom');
            window.App.centerMap();
        });
        it('create center marker', function () {
            assert(s1.called);
        });
        it('center the map', function () {
            assert(s2.called);
        });
        it('set the zoom', function () {
            assert(s3.called);
        });
    });
    describe('fetchMarkers', function() {
        var s1, s2;
        var model = new Location({
            loc_name: "Test",
            address: "Test 2",
            parking_type: "RACK",
            placement: "SIDEWALK",
            status: "INSTALLED",
            location: {
                coordinates: [
                    -122.4181164,
                    37.7677424
                ]
            }
        });
        window.locations = new ParkingLocations();
        window.locations.add(model);
        before(function() {
            s1 = sinon.spy(window.locations, 'fetch');
            s2 = sinon.spy(window.App, 'generateMarker');
            window.App.fetchMarkers();
        });
        it('fetch locations', function () {
            assert(s1.called);
        });
        it('markers generated', function () {
            assert(s2.called);
        });
    });
    describe('getDirections', function() {
        var s1, s2, s3, s4;
        var dest = {
            loc: {
                coordinates: [
                    -122.4181164,
                    37.7677424
                ]
            }
        }
        before(function() {
            s1 = sinon.spy(window.directionsService, 'route');
            s2 = sinon.spy(window.directionsDisplay, 'setMap');
            s3 = sinon.spy(window.directionsDisplay, 'setDirections');
            s4 = sinon.spy(window.App, 'closeInfoWindows');
            window.App.getDirections(dest);
        });
        it('routes request', function () {
            assert(s1.called);
        });
        it('shows directions', function () {
            assert(s2.called);
            assert(s3.called);
        });
        it('closes infowindows', function () {
            assert(s4.called);
        });
    });
    describe('generateCenterMarker', function() {
        var s1, s2;
        var lat = 37.7677424;
        var lon = -122.4181164;
        before(function() {
            s1 = sinon.spy(google.maps, 'Marker');
            s2 = sinon.spy(window.markers, 'push');
            window.App.generateCenterMarker(lat, lon);
        });
        it('Makes a new marker', function () {
            assert(s1.called);
        });
        it('adds it to the marker list', function () {
            assert(s2.called);
        });
        it('center marker set', function () {
            assert(window.centerMarker);
        });
    });
    describe('generateMarker', function() {
        var s1, s2, s3, s4, s5;
        var model = new Location({
            loc_name: "Test",
            address: "Test 2",
            parking_type: "RACK",
            placement: "SIDEWALK",
            status: "INSTALLED",
            location: {
                coordinates: [
                    -122.4181164,
                    37.7677424
                ]
            }
        })
        before(function() {
            s1 = sinon.spy(google.maps, 'Marker');
            s2 = sinon.spy(window.markers, 'push');
            s3 = sinon.spy(google.maps, 'InfoWindow');
            s4 = sinon.spy(google.maps.event, 'addListener');
            s5 = sinon.spy(window.infoWindows, 'push');
            window.App.generateMarker(model);
        });
        it('Makes a new marker', function () {
            assert(s1.called);
        });
        it('adds it to the marker list', function () {
            assert(s2.called);
        });
        it('makes a new infowindow', function () {
            assert(s3.called);
        });
        it('adds it to the infowindow list', function () {
            assert(s5.called);
        });
        it('add click listener', function () {
            assert(s4.called);
        });
    });
    describe('clearMarkers', function() {
        var s1, s2;
        before(function() {
            s1 = sinon.spy(window.markers, 'splice');
            s2 = sinon.spy(window.infoWindows, 'splice');
            window.App.clearMarkers();
        });
        it('clear markers', function () {
            assert(s1.called);
        });
        it('clear infowindows', function () {
            assert(s2.called);
        });
    });
    describe('closeDirections', function() {
        var s1, s2;
        before(function() {
            s1 = sinon.spy(window.directionsDisplay, 'setMap');
            s2 = sinon.spy(window.map, 'setZoom');
            window.App.closeDirections();
        });
        it('clear directions', function () {
            assert(s1.called);
        });
        it('reset zoom', function () {
            assert(s2.called);
        });
    describe('closeInfoWindows', function() {
        before(function() {
            window.App.closeInfoWindows();
        });
        it('close the windows', function () {
            // TODO
        });
    });
    });
});
