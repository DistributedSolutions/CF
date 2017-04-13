angular.module("CFApp")
.controller("channelController",["$scope", "$routeParams", "$http", "jsonRPCService", "$log",
	function($scope, $routeParams, $http, jsonRPCService, $log){
		var channelScope = $scope;

		// START
		channelScope.channel = {};
		jsonRPCService.getChannel($routeParams.key, (result) => {
			channelScope.channel = result;
			channelScope.channelString = JSON.stringify(result, null, 2);
		});
		//------
	}]);