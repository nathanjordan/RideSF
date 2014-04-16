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
    increaseRadius: function() {
        if (window.radius < 500) {
            window.radius += 100;
        }
        this.render();
    },
    decreaseRadius: function() {
        if (window.radius > 100) {
            window.radius -= 100;
        }
        this.render();
    },
    updateMap: function() {
        window.App.updateMap();
    }
});
