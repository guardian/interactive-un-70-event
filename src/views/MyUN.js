var Backbone = require('exoskeleton');
Backbone.NativeView = require('backbone.nativeview');
Backbone.ajax = require('backbone.nativeajax');
var Mustache = require('mustache');

var Collection = Backbone.Collection.extend({

	url: 'http://interactive.guim.co.uk/docsdata-test/' +
		 '1YZKHghxCPhxbJH65K0GxzDb9-Id2t5O8hTxLw9jyN_w.json',

	parse: function(json) {
		if ( !json || !json.hasOwnProperty('sheets') || json.hasOwnProperty('data') ) {
			return console.warn('Unexpected JSON data', json);
		}
		return json.sheets.data;
	}
});

var BaseView = Backbone.NativeView.extend({

	html: require('../html/myUN.html'),

	initialize: function() {
		this.el.classList.add('gv-myun');
	},

	render: function() {
		this.collection.models.forEach( function( model ) {
			console.log( model );
		});

		this.el.innerHTML = Mustache.render( this.html, { message: 'Hello' });
	}

});

module.exports = function( el ) {
	var baseView = new BaseView({
		el: el,
		collection: new Collection()
	});

	baseView.collection.on('sync', baseView.render, baseView);
	baseView.collection.fetch();
}
