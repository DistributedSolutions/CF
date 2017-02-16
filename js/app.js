var mainApp=angular.module("CFApp",["ngRoute"]);

mainApp.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$routeProvider
	.when("/",{
		templateUrl : "mainSearch.html",
		controller : "mainSearchController",
	})
	.when("/settings",{
		templateUrl : "settingsChoice.html",
		controller : "settingsController",
	})
	.when("/settings/:id", {
		templateUrl : "settings.html",
		controller : "settingsController",
	})
	.when("/torrent", {
		templateUrl : "torrent.html",
		controller : "torrentController",
	})
	.otherwise({
		template : "<p>otherwise</p>"
	});
	$locationProvider.html5Mode({
		enabled: false,
		requireBase: false
	});
}]);


// Importing this adds a right-click menu with 'Inspect Element' option
const remote = require('remote')
const Menu = remote.require('menu')
const MenuItem = remote.require('menu-item')

let rightClickPosition = null

const menu = new Menu()
const menuItem = new MenuItem({
  label: 'Inspect Element',
  click: () => {
    remote.getCurrentWindow().inspectElement(rightClickPosition.x, rightClickPosition.y)
  }
})
menu.append(menuItem)

window.addEventListener('contextmenu', (e) => {
  e.preventDefault()
  rightClickPosition = {x: e.x, y: e.y}
  menu.popup(remote.getCurrentWindow())
}, false)