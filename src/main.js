// Analytics
var analytics = require('./js/utils/analytics.js');
analytics('create', 'UA-25353554-28', 'auto');

var seventyView = require('./views/70.js');
var myUNView = require('./views/MyUN.js');



function boot(el) {
	var query = document.location.search;
	if ( query.search('70') > 0 ) {
		seventyView(el);
	} else {
		myUNView(el);
	}
}

module.exports = { boot: boot };
