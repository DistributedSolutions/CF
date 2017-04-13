angular.module("CFApp")
.controller("contentController",["$scope", "$routeParams", "$http", "jsonRPCService", "$log",
	function($scope, $routeParams, $http, jsonRPCService, $log){
		var contentScope = $scope;

		//-START-
		contentScope.content = {};
		jsonRPCService.getContent($routeParams.key, (result) => {
			contentScope.content = result;
			contentScope.contentString = JSON.stringify(result, null, 2);
		});
		//-------
	}]);