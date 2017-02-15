angular.module("CFApp")
	.controller("indexController",["$scope", "interfaceDBService",
		function($scope, interfaceDBService){
			var indexScope = $scope;
			interfaceDBService.init();
		}
		]);