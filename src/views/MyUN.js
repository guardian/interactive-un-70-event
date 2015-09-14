var getJSON = require('../js/utils/getjson');
var Ractive = require('ractive');
var html = require('../html/myUN.html');
var countries = require('../data/countries.json');
var svgs = require('./svgs.js');

// Analytics
var analytics = require('../js/utils/analytics.js');
analytics('create', 'UA-25353554-28', 'auto');
analytics('send', 'pageview', { 'title': 'My UN' });

// Variables
var container;
var data;
var app;
var clickedPersona;

function allAges(){
	var agesArray = [];
	for(i=1;i<91;i++){
		agesArray.push(i);
	}
	return agesArray;
}

var profiles = [{
		filter: {
			gender: "Male",
			country: "Vietnam",
			age: 60
		},
		active: true
	},{
		filter: {
			gender: "Female",
			country: "Democratic Republic of the Congo",
			age: 55
		},
		active: false
	},{
		filter: {
			gender: "Male",
			country: "Brazil",
			age: 12
		},
		active: false
	},{
		filter: {
			gender: "Female",
			country: "Sweden",
			age: 9
		},
		active: false
	}
]

function init(el){
	container = el;
	getJSON('http://interactive.guim.co.uk/docsdata-test/1iPEGi3EQBQA3biqQsu_XizgD6A-w8uffRvQ7hbDkANA.json',function(json){
		console.warn('REPLACE WITH REAL SPREADSHEET !!!!!!!!!!');

		var con = {};
		data = json.sheets.myun.map(function(i){
			i.SVG = svgs[i.CATEGORY];

			if(i.COUNTRIES.toLowerCase() === "everyone" || i.COUNTRIES.toLowerCase() === "all"){
				i.COUNTRIES = "all";
			}else{
				i.COUNTRIES = i.COUNTRIES.split(',');
				i.COUNTRIES = i.COUNTRIES.map(function(country) {

					var countryName = country.replace(/\r|\n|\t/g, '').trim();

					if (!con.hasOwnProperty(countryName)) {
						con[countryName] = true;
					}

					// Normalise country names
					if (countryName === "DRC") {
						countryName = "Democratic Republic of the Congo"
					}

					if (countryName === "CAR") {
						countryName = "Central African Republic"
					}

					if (countryName === "São Tomé and Príncipe") {
						countryName = "Sao Tome and Principe"
					}

					if (countryName === "Myanmar") {
						countryName = "Burma"
					}

					if (countryName === "Mauritiana") {
						countryName = "Mauritania"
					}

					var item = countries.filter(function (country) {
						return country[1].toLowerCase() === countryName.toLowerCase();
					});
					if (item.length === 0 ) {
						console.log(countryName);
					}

					return countryName;
				});
				i.COUNTRIES = i.COUNTRIES.filter(function(country) { return country.trim !== ""; });
			}

			if(i.AGES.toLowerCase() === "all" || i.AGES.toLowerCase() === "everyone"){
				i.AGES = "all"
			}
			i.AGES = i.AGES.replace(' and older','')
			i.AGES = i.AGES.replace(' and above','')
			i.AGES = i.AGES.replace('All over ','')

			i.priority = parseInt(i.priority, 10);

			if(i.TYPES.toLowerCase() === "all" || i.TYPES.toLowerCase() === "everyone" || i.TYPES.toLowerCase() === "all "){
				i.TYPES = "all"
			}
			return i;
		});


		loadPage();
		// createFilters();
	});
}

function loadPage(){
	app = new Ractive({
		template: html,
		data: {
			profiles: profiles,
			activeFilter: {
				gender: "Male",
				country: "Vietnam",
				age: 60
			},
			resolutions: [],
			all: data,
			filters: {
				COUNTRIES: countries.map(function(country) { return country[1]; } ),
				AGES: allAges(),
				TYPES: ["Male","Female"]
			},
			activeResolution: 0,
			illustrations: svgs
		},
		el: el
	})
	console.log(document.location.hash)
	if(document.location.hash === "#all"){
		app.set('all',data);
		app.set('test','true');
	}
	app.on('updateProfile',function(e){
		clickedPersona = true;
		app.set('activeFilter', {
			gender: e.context.filter.gender,
			country: e.context.filter.country,
			age: e.context.filter.age
		})
	})

	app.observe('activeFilter',updateResults);

	app.on('shareTwitter', function(e) {
		var twitterBaseUrl = 'https://twitter.com/intent/tweet?text=';
		var shortURL = 'http://gu.com/xxxx';
		var resolutionCount = e.context.resolutions.length;
		var twitterMessage = 'The UN\'s helped me in ' + resolutionCount + ' ways. How about you? #UNfuture ' + shortURL;
		var shareWindow = twitterBaseUrl + encodeURIComponent(twitterMessage)
		window.open(shareWindow, 'Twitter share', 'width=640,height=320');

	});

	app.on('expandResolution',function(e){
		if(e.index.i !== app.get('activeResolution')){
			app.set('activeResolution',e.index.i);
			analytics('send', 'event', 'UI', 'click-tap', 'ExpandMission');
		}
	})
}

function updateResults(){
	var filter = app.get('activeFilter');
	var results = data.filter(function(i){
		// Special case some countries and headlines
		if (filter.country === 'South Africa' && !!(i.HEADLINE.search('HIV and Aid') > -1)) {
			i.orderPriority = 1;
		}

		if(i.COUNTRIES === "all"){
			i.orderPriority = i.priority;
			return true
		}else{
			return i.COUNTRIES.filter(function(country){
				if(i.priority < 0){
					i.orderPriority = -100;
				}else{
					i.orderPriority = i.priority - 2;
				}
				return country === filter.country;
			}).length > 0
		}

	}).filter(function(i){
		return i.AGES === "all" || filter.age >= Number(i.AGES)
	}).filter(function(i){
		if(filter.gender === "Female"){
			return true
		}else{
			return i.TYPES === "all"
		}
	}).sort(function(a,b){
		if (a.orderPriority < b.orderPriority)
		    return 1;
		  if (a.orderPriority > b.orderPriority)
		    return -1;
		  return 0;
	}).reverse()

	function duplicatez(){
		var list = ['South Africa', 'Botswana', 'India', 'Russia', 'Ukraine', 'Swaziland', 'Thailand', 'Namibia', 'Mozambique', 'Zambia', 'Zimbabwe', 'Democratic Republic of the Congo', 'Uganda', 'Tanzania', 'Lesotho', 'Malawi', 'Nigeria', 'Kenya', 'Gabon', 'Equatorial Guinea', 'Congo', 'Central African Republic', 'Cameroon'];
		var strippedCountries = [];
		countries.forEach(function(i,j){
			// if(list.indexOf(i[1]) === -1){
				strippedCountries.push(i[1]);
			// }
		})
		console.log(JSON.stringify(strippedCountries));
	}

	duplicatez();
	console.log(results)
	if(clickedPersona){
		analytics('send', 'event', 'UI', 'click-tap', 'Persona: ' + filter.country + " - " + filter.age + " - " + filter.gender);
	}else{
		analytics('send', 'event', 'UI', 'click-tap', 'Dropdown: ' + filter.country + " - " + filter.age + " - " + filter.gender);
	}
	clickedPersona = false;
	app.set('activeResolution',0);
	app.set('resolutions', results);
}

function createFilters(){
	var categories = ["COUNTRIES","AGES","TYPES"];
	var filterValues = {
		COUNTRIES: [],
		AGES: [],
		TYPES: []
	};
	categories.forEach(function(category){
		data.forEach(function(i){
			if(i[category] !== "all"){
				if(category === "COUNTRIES"){
					i[category].forEach(function(j){
						if(filterValues[category].indexOf(j) === -1){
							filterValues[category].push(j);
						}
					})
				}
				else{
					if(filterValues[category].indexOf(i[category]) === -1){
						if(i[category] !== "Koreas: All Others: 60 and above"){
							filterValues[category].push(i[category]);
						}

					}
				}
			}
		})
	});

	app.set('filters',filterValues)
}

module.exports = function(el) {
	el.classList.add('gv-myun');
	init(el);
}

