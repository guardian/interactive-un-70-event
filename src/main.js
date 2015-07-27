var Backbone = require('backbone');
var _ = require('underscore');

var UNCollection = Backbone.Collection.extend({
	url: 'http://interactive.guim.co.uk/docsdata-test/' +
		 '1BbsWwQGxaIcuQYnHCE6m697qx6klTe_jOm8E93NgRLk.json',

	parse: function(json) {
		return json[0];
	}
});


var EventView = Backbone.View.extend({

	html: require('./html/event.html'),

	className: 'gv-event',

	initialize: function() {
		this.template = _.template(this.html)
	},

	render: function() {
		var index = this.model.collection.indexOf(this.model);
		this.$el.html( this.template({
			YEAR: this.model.get('YEAR'),
			EVENT: this.model.get('EVENT').split(' ').slice(0, 4).join(' ')
		}));
		this.$el.css('background-image', 'url(http://lorempixel.com/g/200/200/?' + Date.now() * Math.random() + ')');
		this.$el.css('z-index', index);
		setTimeout(function() {
			this.$el.addClass('active');
		}.bind(this), index * 1000);
		return this;
	}

});


var UNEventsBaseView = Backbone.View.extend({

	init: function() {
		this.eventViews = this.collection.map(function(eventModel) {
			return new EventView({ model: eventModel });
		});
		this.render();
	},

	render: function() {
		this.$el.addClass('intro');
		setTimeout(function() {
			this.$el.removeClass('intro');
		}.bind(this), 70 * 1000);

		this.eventViews.forEach(function(item) {
			this.$el.append(item.render().$el);
		}, this);
	}

});


/**
 * Boot the app.
 */
function boot(el) {

	var baseView = new UNEventsBaseView({
		el: el,
		collection: new UNCollection()
	});

	baseView.collection.on('sync', baseView.init, baseView);
	baseView.collection.fetch();
}

module.exports = { boot: boot };
