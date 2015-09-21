require('./js/utils/classList.js');

// Main boot
function boot(el) {
	var query = document.location.search;
	if ( query.search('70') > 0 ) {
		var seventyView = require('./views/70.js');
		seventyView(el);
	} else {
		var myUNView = require('./views/MyUN.js');
		myUNView(el);
	}
}

module.exports = { boot: boot };
