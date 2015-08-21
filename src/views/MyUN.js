var getJSON = require('../js/utils/getjson');
var Ractive = require('ractive');
var html = require('../html/myUN.html');
var svgs = {
	weapons: require('../imgs/illustrations/aid.svg'),
	democracy: require('../imgs/illustrations/democracy.svg'),
	energy: require('../imgs/illustrations/energy.svg'),
	food: require('../imgs/illustrations/food.svg'),
	aid: require('../imgs/illustrations/aid.svg'),
	health: require('../imgs/illustrations/health.svg'),
	money: require('../imgs/illustrations/money.svg'),
	refugees: require('../imgs/illustrations/refugees.svg'),
	rights: require('../imgs/illustrations/rights.svg'),
	terrorism: require('../imgs/illustrations/terrorism.svg'),
	un: require('../imgs/illustrations/un.svg'),
}

var countries = require('../data/countries.json');
console.log(countries);

// Analytics
var analytics = require('../js/utils/analytics.js');
analytics('create', 'UA-25353554-28', 'auto');
analytics('send', 'pageview', { 'title': 'My UN' });

// Variables
var container;
var data;
var app;
var clickedPersona;

var profiles = [{
		id: "nigerianwoman",
		filter: {
			gender: "Female",
			country: "Nigeria",
			age: 12
		},
		active: true
	},{
		id: "blabla",
		filter: {
			gender: "Male",
			country: "Congo",
			age: 17
		},
		active: false
	},{
		id: "anotherperson",
		filter: {
			gender: "Male",
			country: "Palestine",
			age: 18
		},
		active: false
	},{
		id: "andanotherperson",
		filter: {
			gender: "Female",
			country: "UK",
			age: 23
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
			if(i.COUNTRIES.toLowerCase() === "everyone" || i.COUNTRIES.toLowerCase() === "all"){
				i.COUNTRIES = "all";
			}else{
				i.COUNTRIES = i.COUNTRIES.split(',');
				i.COUNTRIES = i.COUNTRIES.map(function(country) {
					var countryName = country.replace(/\r|\n|\t/g, '').trim();


					if (!con.hasOwnProperty(countryName)) {
						con[countryName] = true;
					}


					if (countryName === "DRC") {
						countryName = "Democratic Republic of the Congo"
					}

					if (countryName === "São Tomé and Príncipe") {
						countryName = "Sao Tome and Principe"
					}

					if (countryName === "Myanmar") {
						countryName = "Burma"
					}


					var item = countries.filter(function ( country ) {
						return country[1].toLowerCase() === countryName.toLowerCase();
					});
					if (item.length ===0 ) {
						console.log(countryName);
					}

					return countryName;
				});
				i.COUNTRIES = i.COUNTRIES.filter(function(country) { return country.trim !== ""; });
			}

			if (i.CATEGORY.trim() === "") {

			console.log(i);
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

		console.log(con);
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
				gender: profiles[0].filter.gender,
				country: profiles[0].filter.country,
				age: profiles[0].filter.age
			},
			resolutions: [],
			filters: {
				COUNTRIES: countries.map(function(country) { return country[1]; } ),
				AGES: [12,17,18,23,24,25,26,55,60],
				TYPES: ["Male","Female"]
			},
			activeResolution: 0,
			illustrations: svgs
		},
		el: el
	})

	app.on('updateProfile',function(e){
		clickedPersona = true;
		app.set('activeFilter', {
			gender: e.context.filter.gender,
			country: e.context.filter.country,
			age: e.context.filter.age
		})
	})

	app.observe('activeFilter',updateResults);

	app.on('expandResolution',function(e){
		if(e.index.i !== app.get('activeResolution')){
			app.set('activeResolution',e.index.i);
			analytics('send', 'event', 'UI', 'click-tap', 'ExpandMission');
			var resolutionHeight = document.querySelector('.resolution.active .content-container').clientHeight;
			var illustrationHeight = document.querySelector('.resolution.active .illustration-container').clientHeight + 10;
			var margin = (resolutionHeight - illustrationHeight)/2;
			if(margin > 20){
				if(e.context.CATEGORY === "terrorism"){
					document.querySelector('.resolution.active .pusher').style.height = (resolutionHeight - illustrationHeight) + 'px';
				}else if(e.context.CATEGORY === "rights"){
					document.querySelector('.resolution.active .pusher').style.height = (resolutionHeight - illustrationHeight) + 'px';
				}else{
					document.querySelector('.resolution.active .pusher').style.height = margin + 'px';
				}
			}

			var paths = document.querySelectorAll('.resolution.active svg path');
			var max = paths.length;
			var fadeIn = false;
			var speed = 300/max;

			function fadeOutSvg(num){
				setTimeout(function(){
					paths[num].setAttribute('data-old', paths[num].style.fill);
					paths[num].style.fill = "#eee";
					if(num > max-(max/3) && !fadeIn){
						fadeIn = true;
						// fadeInSvg(0);
					}
					if(paths[num + 1]){
						num++;
						fadeOutSvg(num);
					}else{
						fadeInSvg(0);
					}
				},speed)
			}
			function fadeInSvg(num){
				setTimeout(function(){
					 paths[num].style.fill = paths[num].getAttribute('data-old');

					if(paths[num + 1]){
						num++;
						fadeInSvg(num);
					}
				},speed)
			}

			// fadeOutSvg(0);
		}
	})
}

function updateResults(){
	var filter = app.get('activeFilter');
	var results = data.filter(function(i){
		if(i.COUNTRIES === "all"){
			i.orderPriority = i.priority;
			return true
		}else{
			return i.COUNTRIES.filter(function(country){
				i.orderPriority = i.priority + 3;
				return country === filter.country;
			}).length > 0
		}
	}).filter(function(i){
		console.log(i.AGES.replace(" and above", ""))
		return i.AGES === "all" || i.AGES <= filter.age
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
	})
	if(clickedPersona){
		analytics('send', 'event', 'UI', 'click-tap', 'Persona: ' + filter.country + " - " + filter.age + " - " + filter.gender);
	}else{
		analytics('send', 'event', 'UI', 'click-tap', 'Dropdown: ' + filter.country + " - " + filter.age + " - " + filter.gender);
	}
	clickedPersona = false;
	app.set('activeResolution',0)
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
						console.log(i[category])
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

