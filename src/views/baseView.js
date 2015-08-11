var Backbone = require('exoskeleton');
Backbone.NativeView = require('backbone.nativeview');
Backbone.ajax = require('backbone.nativeajax');
var dispatcher = Object(Backbone.Events);
var Hammer = require('hammerjs');
var eventHTML = require('../html/event.html');
var modalHTML = require('../html/modal.html');
var chroma = require('chroma-js');
var Mustache = require('mustache');
Mustache.parse(eventHTML);
Mustache.parse(modalHTML);




var Collection = Backbone.Collection.extend({

	url: 'http://interactive.guim.co.uk/docsdata-test/' +
		 '1YZKHghxCPhxbJH65K0GxzDb9-Id2t5O8hTxLw9jyN_w.json',

});


var baseView = new BaseView({
	el: el,
	collection: new Collection()
});

module.exports = function(el, URL) {

}
