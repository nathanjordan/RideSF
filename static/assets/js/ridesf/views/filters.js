FilterView = Backbone.View.extend({
    initialize: function() {
        this.render();
    },
    render: function() {
        var template = _.template($("#filters-template").html(), {
            percent: (window.radius / 500.0) * 100,
            radius: window.radius
        });
        this.$el.html(template);
    },
    events: {
        "click .btn-increase": 'increaseRadius',
        "click .btn-decrease": 'decreaseRadius',
        "click .btn-update": 'updateMap',
    },

    /*
     *   Increases the search radius
     */
    increaseRadius: function() {
        // Radius maximum is 500m
        if (window.radius < 500) {
            window.radius += 100;
        }
        this.render();
    },

    /*
     *   Decreases the search radius
     */
    decreaseRadius: function() {
        // Radius minimum is 100m
        if (window.radius > 100) {
            window.radius -= 100;
        }
        this.render();
    },

    /*
     *   Refresh the map
     */
    updateMap: function() {
        window.App.updateMap();
    }
});
