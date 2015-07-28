var Backbone = require('backbone');
var _ = require('underscore');
var dispatcher = _.clone(Backbone.Events)

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
		dispatcher.on('modalopen', this.closeModal, this);
	},

	openModal: function() {
		dispatcher.trigger('modalopen');
		this.$el.addClass('active');
		this.$modal.appendTo('.gv-wrapper');
	},

	closeModal: function() {
		this.$modal.appendTo(this.$el);
		this.$el.removeClass('active');
		dispatcher.trigger('modalclose');
	},


	render: function() {
		var index = this.model.collection.indexOf(this.model);
		this.$el.html( this.template({
			YEAR: this.model.get('YEAR'),
			EVENT: this.model.get('EVENT').split(' ').slice(0, 4).join(' ')
		}));

		this.$el.addClass(this.model.get('CATEGORY'));
		this.$el.css('background-image', 'url(http://lorempixel.com/g/200/200/?' + Date.now() * Math.random() + ')');
		this.$el.css('z-index', index);
		this.$el.css('z-index', index);
		this.$el.css('transition-delay', (index * 100) + 'ms' );

		this.$modal = this.$('.gv-event-modal');


		this.$modal.click(this.closeModal.bind(this));
		this.$el.click(this.openModal.bind(this));



		return this;
	}

});


var UNEventsBaseView = Backbone.View.extend({

	html: require('./html/base.html'),

	className: 'gv-base',

	initialize: function() {
		this.template = _.template(this.html);
	},

	init: function() {
		this.eventViews = this.collection.map(function(eventModel) {
			return new EventView({ model: eventModel });
		});

		dispatcher.on('modalopen', function() {
			this.$el.addClass('modal-open');
		}, this);


		dispatcher.on('modalclose', function() {
			this.$el.removeClass('modal-open');
		}, this);

		this.render();
	},

	skip: function() {
		this.$el.removeClass('intro');
		this.$el.addClass('grid');
		this.$skipbtn.remove();
		this.eventViews.forEach(function(item) {
				item.$el.css('transition-delay', '0ms' );
			}, this);
	},

	render: function() {
		this.$el.html( this.template() );
		this.$wrapper = this.$('.gv-wrapper');
		this.$overlay = this.$('.gv-wrapper-overlay');

		setTimeout(function() {
			this.$el.addClass('intro');
		}.bind(this), 100);

		this.$skipbtn = this.$('.gv-btn-skip')
		this.$skipbtn.click( this.skip.bind(this) );

		setTimeout(this.skip.bind(this), 7 * 1000);

		this.eventViews.forEach(function(item) {
			this.$wrapper.append(item.render().$el);
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

	console.log(baseView);
}

module.exports = { boot: boot };
