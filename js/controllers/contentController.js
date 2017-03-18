angular.module("CFApp")
.controller("contentController",["$scope", "$routeParams", "$http", "jsonRPCService", "$log",
	function($scope, $routeParams, $http, jsonRPCService, $log){
		var channelScope = $scope;

		channelScope.getContent = function(contentKey) {
			var rpc = jsonRPCService.getJsonRpc(jsonRPCService.getContent, contentKey);
			$http(rpc)
			.then((res) => {
				if (res.data.error) {
					//error in rpc
					$log.error("Error in content request key: [" + contentKey + "] error: [" + JSON.stringify(res.data.error) + "]");
				} else {
					//success
					$log.info("Success in content for res data: [" + res.data + "]");
					channelScope.content = res.data.result
					channelScope.contentString = JSON.stringify(res.data.result, null, 2);
				}
			}, (res) => {
				//error on call SHOULD NEVER HAPPEN
				$log.error("Error in content request key, error: [" + JSON.stringify(err) + "]");
			});
		}

		//-START-
		channelScope.content = {};
		channelScope.getContent($routeParams.key);
		//-------
	}]);