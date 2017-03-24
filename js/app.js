var mainApp=angular.module("CFApp",["ngRoute"]);

mainApp.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$routeProvider
	.when("/",{
		templateUrl : "../html/mainSearch.html",
		controller : "mainSearchController",
	})
	.when("/profiles", {
		templateUrl : "../html/profiles.html",
		controller : "profilesController",
	})
	.when("/profiles/:username", {
		templateUrl : "../html/profile.html",
		controller : "profileController",
	})
	.when("/settings",{
		templateUrl : "../html/settings.html",
		controller : "settingsController",
	})
	.when("/torrent", {
		templateUrl : "../html/torrent.html",
		controller : "torrentController",
	})
	.when("/content/", {
		templateUrl : "../html/mixed/content.html",
		controller : "contentController",
	})
	.when("/content/:key", {
		templateUrl : "../html/mixed/content.html",
		controller : "contentController",
	})
	.when("/channel/", {
		templateUrl : "../html/mixed/channel.html",
		controller : "channelController",
	})
	.when("/channel/:key", {
		templateUrl : "../html/mixed/channel.html",
		controller : "channelController",
	});
	
	$locationProvider.html5Mode({enabled: false, requireBase: false});
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