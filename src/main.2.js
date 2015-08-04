var Backbone = require('exoskeleton');
Backbone.NativeView = require('backbone.nativeview');
Backbone.ajax = require('backbone.nativeajax');
var dispatcher = Object(Backbone.Events);
var Hammer = require('hammerjs');
var eventHTML = require('./html/event.html');
var modalHTML = require('./html/modal.html');
var Mustache = require('mustache');
Mustache.parse(eventHTML);
Mustache.parse(modalHTML);


function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

var EventCollection = Backbone.Collection.extend({

	url: 'http://interactive.guim.co.uk/docsdata-test/' +
		 '1YZKHghxCPhxbJH65K0GxzDb9-Id2t5O8hTxLw9jyN_w.json',

	parse: function(json) {

		if ( !json || !json.hasOwnProperty('sheets') || json.hasOwnProperty('data') ) {
			return console.warn('Unexpected JSON data', json);
		}

		return json.sheets.data.map(function(item) {
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
		if (this.el.classList.contains('active') ) {
			this.el.classList.remove('active');
			// this.parent.eventViews.forEach(function(item) {
			// 	item.el.style.height = '';
			// });
			return;
		}

		var targetIndex = this.parent.eventViews.indexOf(this);


		this.parent.eventViews.forEach(function(item, index) {
			item.el.classList.remove('active');
			var indexDelta =  Math.abs(targetIndex - index);
			if ( indexDelta < 7 ) {
				item.el.style.height = 30 * (1 / indexDelta) + 'px' ;
			} else {
				item.el.style.height = '';
			}
		});
		this.el.classList.add('active');
	},

	deactivate: function() {
		this.el.classList.remove('active');
	},

	render: function() {
		var index = this.model.collection.indexOf(this.model);
		this.el.innerHTML = Mustache.render(eventHTML, this.model.attributes);

		var categoryName = this.model.get('CATEGORY');
		if (categoryName && categoryName.trim().length < 1) {
			categoryName = 'unknown';
		}

		this.el.classList.add( categoryName );
		this.el.style.backgroundImage = 'url(http://lorempixel.com/g/200/200/?' + Date.now() * Math.random() + ')';
		this.el.style.zIndex = index;
		this.el.style.transitionDelay = (index * 100) + 'ms' ;
		this.el.addEventListener('click', this.activate.bind(this), false);
		// this.el.addEventListener('click', function() {
        //     dispatcher.trigger('modalopen', this.model);
        // }.bind(this), false) ;

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
				item.el.style.transitionDelay = '';
		}.bind(this) );

		this.hammer.get('pan').set({ direction: Hammer.DIRECTION_HORIZONTAL });
		this.hammer.on('panleft drag panright tap press swipe', this.pan.bind(this) );
	},

	startIntro: function() {
		this.el.classList.add('intro');
	},

	pan: function(ev) {
		ev.preventDefault();
		var index = Math.abs( Math.round( ev.center.x / this.stepWidth ) );
		console.log(index);

		// if ( ev.target.classList.contains('active') ) {
		// 	return;
		// }

		// var yPos = ev.center.y;
		// var nearest;
		// var distance = 10000;
		// this.eventViews.forEach(function( item ) {
		// 	var delta = Math.abs( yPos - item.el.getBoundingClientRect().top);
		// 	if ( delta < distance ) {
		// 		distance = delta;
		// 		nearest = item;
		// 	}
		// }.bind(this));

		// nearest.activate();

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
			eventView.parent = this;
            this.wrapperEl.appendChild( eventView.render().el );
            return eventView;
		}, this);

        this.modalView = new ModalView({
            el: this.el.querySelector('.gv-event-modal')
        });
        this.modalView.render();
		//this.el.classList.add('grid');

		setTimeout(this.startIntro, 200);

		console.log(this.el);
		this.elWidth = this.el.getBoundingClientRect().width;
		this.stepWidth = this.elWidth / this.collection.length;
		this.hammer = new Hammer(this.el, { drag_lock_to_axis: true });


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
