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
	getJSON('http://interactive.guim.co.uk/docsdata-test/1sGrszOfHqI11HQrtAr-7Sq_nVGgZMDN0i0x9XPF9-1s.json',function(json){
		console.error('REPLACE WITH REAL SPREADSHEET');
		data = json.sheets.Sheet1.map(function(i){
			if(i.COUNTRIES.toLowerCase() === "everyone" || i.COUNTRIES.toLowerCase() === "all"){
				i.COUNTRIES = "all";
			}else{
				i.COUNTRIES = i.COUNTRIES.split(', ')
			}

			if(i.AGES.toLowerCase() === "all" || i.AGES.toLowerCase() === "everyone"){
				i.AGES = "all"
			}
			i.AGES = i.AGES.replace(' and older','')
			i.AGES = i.AGES.replace(' and above','')
			i.AGES = i.AGES.replace('All over ','')

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
				gender: profiles[0].filter.gender,
				country: profiles[0].filter.country,
				age: profiles[0].filter.age
			},
			resolutions: [],
			filters: {
				COUNTRIES: ["Ethiopia","Afghanistan","Albania","Algeria","Angola","Antigua","Argentina","Armenia","ArmeniaI","Australia","Azerbaijan","Bahrain","Bangladesh","Barbados","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia","Botswana","Brazil","Britain","Bulgaria","Burkina Faso","Burma","Burundi","CAR","Cambodia","Cameroon","Canada","Cap Verde","Cape Verde","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Cook Islands","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","DRC","Denmark","Djibouti","Dominican Republic","East Timor","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Ethiopia","Fiji","France","French Guiana","Gabon","Gambia","Georgia","Ghana","Greece","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","India","Indonesia","Iran","Iraq","Israel","Italy","Ivory Coast","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Korea","Kosovo","Kuwait","Kyrgyzstan","Laos","Lebanon","Lesotho","Liberia","Libya","Luxembourg","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Marshall islands","Mauritania","Mauritiana","Mauritius","Mexico","Micronesia","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Myanmar","Namibia","Nepal","Netherlands Antilles","New Zealand","Nicaragua","Niger","Nigeria","North Korea","Norway","Oman","Pakistan","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saint Vincent & Grenadines","Samoa","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Sierre Leone","Slovakia","Solomon Islands","Somalia","South \nAfrica","South Africa","South Korea","South Sudan","Sri Lanka","Sudan","Suriname","Swaziland","Sweden","Syria","São Tomé and Príncipe","Tajikistan","Tanzania","Thailand","Togo","Tonga","Trinidad & Tobago","Tunisia","Turkey","Turks and Caicos","UK","US","Uganda","Ukraine","Uruguay","Uzbekistan","Vanuatu","Venezuela","Vietnam","Western Sahara","Yemen","Zambia","Zimbabwe","the Netherlands"],
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
			i.priority = 0;
			return true
		}else{
			return i.COUNTRIES.filter(function(country){
				i.priority = 1;
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
		if (a.priority < b.priority)
		    return 1;
		  if (a.priority > b.priority)
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

