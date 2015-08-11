var Backbone = require('exoskeleton');
Backbone.NativeView = require('backbone.nativeview');
Backbone.ajax = require('backbone.nativeajax');
var Hammer = require('hammerjs');
var eventHTML = require('../html/event.html');
var modalHTML = require('../html/modal.html');
var chroma = require('chroma-js');
var Mustache = require('mustache');
Mustache.parse(eventHTML);
Mustache.parse(modalHTML);



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

	activate: function(model) {
		var targetIndex = this.parent.eventViews.indexOf(this);

		this.parent.eventViews.forEach( function(card, index) {
			card.el.classList.remove('next');
			card.el.classList.remove('next2');
			card.el.classList.remove('active');
			card.el.classList.remove('delt');

			if (index === targetIndex - 2) {
				card.el.classList.add('next2');
			}

			if (index === targetIndex - 1) {
				card.el.classList.add('next');
			}

			if (index === targetIndex + 1 ) {
				card.el.classList.add('delt');
			}

		});

		this.el.classList.add('active');

	},

	render: function() {

		this.el.innerHTML = Mustache.render(eventHTML, this.model.attributes);

		var categoryName = this.model.get('CATEGORY');
		if (categoryName && categoryName.trim().length < 1) {
			categoryName = 'unknown';
		}

		this.el.classList.add( categoryName );
		this.innerEl = this.el.querySelector('.gv-event-inner-wrap');
		this.overlayEl = this.el.querySelector('.gv-event-overlay');
		this.overlayShinyEl = this.el.querySelector('.gv-event-overlay-shiny');
		return this;
	}

});


var BaseView = Backbone.NativeView.extend({

	html: require('../html/base.html'),

	initialize: function() {
		this.el.classList.add('gv-70');
	},

	stopAnimation: function() {
		if ( this.animInterval ) {
			clearInterval( this.animInterval );
			this.animInterval = null;
			this.el.classList.remove('animating');
		}
	},

	pan: function(ev) {
		ev.preventDefault();
		this.stopAnimation();

		var index = Math.round( ev.deltaX / this.stepWidth );
		if ( isNaN( index ) ) { return; }
		index *= -1;

		var newIndex = this.currentIndex  + index;
		newIndex = (newIndex > 70 ) ? 70 : newIndex;
		newIndex = (newIndex < 0 ) ? 0 : newIndex;
		this.showCard( newIndex, ev.type === 'panend');

	},

	showCard: function(index, save) {
		this.eventViews[ index ].activate();
		var percentage = ( index  / (this.collection.models.length - 1) ) * 100;
		this.markerEl.style.left = 'calc( ' + Math.round( percentage ) + '% - 6px)';
		if (save) {
			this.currentIndex = index;
		}
	},

	navNext: function() {
		this.stopAnimation();
		if (this.currentIndex + 1 >= this.collection.length) {
			return;
		}
		this.currentIndex += 1;
		this.showCard(this.currentIndex , true );
	},

	navPrevious: function() {
		this.stopAnimation();
		if (this.currentIndex - 1 < 0) {
			return;
		}
		this.currentIndex -= 1;
		this.showCard(this.currentIndex , true );
	},


	animate: function() {
		if (this.currentIndex + 1 >= this.collection.length) {
			return this.showCard(0 , true );
		}
		this.currentIndex += 1;
		this.showCard(this.currentIndex , true );
	},

	hideIntro: function() {
		this.introEl.classList.add('hide');
	},

	render: function() {
		this.el.innerHTML = this.html;
		// this.overlayEl = this.el.querySelector( '.gv-wrapper-overlay' );
		this.markerEl = this.el.querySelector( '.gv-timeline-marker' );



		var scale = chroma.scale(['#EEE', '#B6E0FF']);
        this.eventViews = this.collection.map(function(eventModel, i, arr) {
			var eventView = new EventView({ model: eventModel });
			eventView.parent = this;
            this.el.appendChild( eventView.render().el );

			// eventView.innerEl.setAttribute('style', '-webkit-filter: grayscale(' + (1 - i / (arr.length -1 ) ) * 100 + '%)' );
			eventView.innerEl.style.backgroundColor = scale( i / (arr.length -1 ) ).hex();

			// eventView.overlayEl.style.opacity =  1 - i / (arr.length -1 );
			// eventView.overlayShinyEl.style.opacity =  i / (arr.length -1 );

            return eventView;
		}, this);

		this.elWidth = this.el.getBoundingClientRect().width;
		this.stepWidth = this.elWidth / this.collection.length;
		this.currentIndex = this.collection.length

		this.hammer = new Hammer(this.el, { drag_lock_to_axis: true });
		this.hammer.get('pan').set({ direction: Hammer.DIRECTION_HORIZONTAL });
		this.hammer.on('panleft panright panend', this.pan.bind(this) );


		//this.currentIndex = this.collection.length - 1;
		this.currentIndex = 0;
		this.showCard(this.currentIndex, true);



		// this.el.classList.add('animating');
		// this.animInterval = setInterval(this.animate.bind(this), 3000);


		this.nextBtn = this.el.querySelector('.gv-nav-next');
		this.nextBtn.addEventListener('click', this.navNext.bind(this), false);

		this.previousBtn = this.el.querySelector('.gv-nav-previous');
		this.previousBtn.addEventListener('click', this.navPrevious.bind(this), false);

		this.introEl = this.el.querySelector('.gv-intro');
		this.introEl.addEventListener('click', this.hideIntro.bind(this), false);
		this.introEl.addEventListener('touchstart', this.hideIntro.bind(this), false);


	}

});




module.exports = function( el ) {
	var baseView = new BaseView({
		el: el,
		collection: new EventCollection()
	});

	baseView.collection.on('sync', baseView.render, baseView);
	baseView.collection.fetch();
}
