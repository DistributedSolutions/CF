var mainApp=angular.module("CFApp",["ngRoute"]);

mainApp.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$routeProvider
	.when("/",{
		templateUrl : "menus.html",
		controller : "menusController",
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
