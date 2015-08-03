var Backbone = require('exoskeleton');
Backbone.NativeView = require('backbone.nativeview');
Backbone.ajax = require('backbone.nativeajax');
var dispatcher = Object(Backbone.Events);
var eventHTML = require('./html/event.html');
var modalHTML = require('./html/modal.html');
var Mustache = require('mustache');
Mustache.parse(eventHTML);
Mustache.parse(modalHTML);

var EventCollection = Backbone.Collection.extend({

	url: 'http://interactive.guim.co.uk/docsdata-test/' +
		 '1BbsWwQGxaIcuQYnHCE6m697qx6klTe_jOm8E93NgRLk.json',

	parse: function(json) {
        
		return json[0].map(function(item) {
            if (item.IMAGES) {
                item.IMAGES = item.IMAGES.replace('"', '');
                item.IMAGES = item.IMAGES.split(',');
            }
            return item;
        });

	}
});



var EventView = Backbone.NativeView.extend({

	className: 'gv-event',

    initialize: function() {
        dispatcher.on('modalclose', this.deactivate, this);
    },

	activate: function(model) {
        if (this.model !== model) {
            console.log(this.model, model);
            return this.deactivate();
        }

		this.el.classList.add('active');
	},

	deactivate: function() {
		this.el.classList.remove('active');
	},

	render: function() {
		var index = this.model.collection.indexOf(this.model);
		this.el.innerHTML = Mustache.render(eventHTML, this.model.attributes); 

		// var categoryName = this.model.get('CATEGORY');
		// if (categoryName.trim().length < 1) {
		// 	categoryName = 'unknown';
		// }
        //
		// this.el.classList.add( categoryName );
		// this.el.style.backgroundImage = 'url(http://lorempixel.com/g/200/200/?' + Date.now() + ')';
		this.el.style.zIndex = index;
		this.el.style.transitionDelay = (index * 100) + 'ms' ;
		// this.el.addEventListener('click', this.activate.bind(this), false);
		this.el.addEventListener('click', function() {
            dispatcher.trigger('modalopen', this.model);
        }.bind(this), false) ;

		return this;
	}

});

var ModalView = Backbone.NativeView.extend( {

    initialize: function() {
        dispatcher.on('modalopen', this.show, this);
    },

	show: function( model ) {
        console.log(model, this);
	    this.innerEl.innerHTML = Mustache.render(modalHTML, (model) ? model.attributes : {} );
		this.el.classList.add( 'active' );
	},

	hide: function() {
		this.el.classList.remove( 'active' );
        dispatcher.trigger('modalclose');
	},

	render: function() {
        this.innerEl = this.el.querySelector('.gv-event-modal-inner');
        this.closeEl = this.el.querySelector('.gv-event-modal-close');
        this.closeEl.addEventListener( 'click', this.hide.bind(this), false );
	    return this;
	}

} );


var BaseView = Backbone.NativeView.extend({

	html: require('./html/base.html'),

	className: 'gv-base',

	initialize: function() {

		dispatcher.on('modalopen', function() {
			this.el.classList.add('modal-open');
		}, this);


		dispatcher.on('modalclose', function() {
			this.el.classList.remove('modal-open');
		}, this);

    },

	skip: function() {
		clearTimeout( this.introTimeout );
		this.el.classList.remove('intro');
		this.el.classList.add('grid');
		this.skipbtn.parentNode.removeChild( this.skipbtn );
		this.eventViews.forEach(function(item) {
				item.el.style.transitionDelay = '0ms';
		}.bind(this) );
	},

	startIntro: function() {
		this.el.classList.add('intro');
	},

	render: function() {
		this.el.innerHTML = this.html;
		this.wrapperEl = this.el.querySelector( '.gv-wrapper' );
		this.overlayEl = this.el.querySelector( '.gv-wrapper-overlay' );

		this.skipbtn = this.el.querySelector('.gv-btn-skip');
		this.skipbtn.addEventListener('click', this.skip.bind(this), false);

		this.introTimeout = setTimeout(this.skip.bind(this), 7 * 1000);
        
        
        this.eventViews = this.collection.map(function(eventModel) {
			var eventView = new EventView({ model: eventModel });
            this.wrapperEl.appendChild( eventView.render().el );
            return eventView;
		}, this);

        this.modalView = new ModalView({
            el: this.el.querySelector('.gv-event-modal')
        });
        this.modalView.render();
		this.el.classList.add('grid');

		// setTimeout(this.startIntro, 200);
	}

});


function boot(el) {

	var baseView = new BaseView({
		el: el,
		collection: new EventCollection()
	});

	baseView.collection.on('sync', baseView.render, baseView);
	baseView.collection.fetch();
}

module.exports = { boot: boot };
