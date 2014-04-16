Location = Backbone.Model.extend({
    urlRoot: '/location'
});

ParkingLocations = Backbone.Collection.extend({
    url: '/locations',
    model: Location,
    parse: function(data) {
        return data.results
    }
});
