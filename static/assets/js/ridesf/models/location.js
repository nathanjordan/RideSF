/*
 *   Represents a bike parking location
 */
Location = Backbone.Model.extend({
    urlRoot: '/location'
});

/*
 *   Represents a list of bike parking locations
 */
ParkingLocations = Backbone.Collection.extend({
    url: '/locations',
    model: Location,
    parse: function(data) {
        return data.results
    }
});
