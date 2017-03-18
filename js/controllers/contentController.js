angular.module("CFApp")
.controller("contentController",["$scope", "$routeParams", "$http", "jsonRPCService", "$log",
	function($scope, $routeParams, $http, jsonRPCService, $log){
		var contentScope = $scope;

		contentScope.getContent = function(contentKey) {
			var rpc = jsonRPCService.getJsonRpc(jsonRPCService.getContent, contentKey);
			$http(rpc)
			.then((res) => {
				if (res.data.error) {
					//error in rpc
					$log.error("Error in content request key: [" + contentKey + "] error: [" + JSON.stringify(res.data.error) + "]");
				} else {
					//success
					$log.info("Success in content for res data: [" + res.data + "]");
					contentScope.content = res.data.result;
					contentScope.contentString = JSON.stringify(res.data.result, null, 2);
				}
			}, (res) => {
				//error on call SHOULD NEVER HAPPEN
				$log.error("Error in content request key, error: [" + JSON.stringify(err) + "]");
			});
		}

		//-START-
		contentScope.content = {};
		contentScope.getContent($routeParams.key);
		//-------
	}]);