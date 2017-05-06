angular.module("CFApp")
.controller("channelController",["$scope", "$routeParams", "$http", "jsonRpcService", "$log",
	function($scope, $routeParams, $http, jsonRpcService, $log){
		var channelScope = $scope;

		// START
		channelScope.channel = {};
		jsonRpcService.getChannel($routeParams.key, (result) => {
			channelScope.channel = result;
			channelScope.channelString = JSON.stringify(result, null, 2);
		});
		//------
	}]);