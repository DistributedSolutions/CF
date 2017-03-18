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
					// var tempArr = groupBy4(res.data.result.contentlist);
					$log.info("Success in content for res data: [" + res.data + "]");
					// mainSearchScope.contentTags[tagIndex].content = tempArr;
					channelScope.content = JSON.stringify(res.data, null, 2);
					// $log.info("YES [" +  + "]");
				}
			}, (res) => {
				//error on call SHOULD NEVER HAPPEN
				$log.error("Error in content request key, error: [" + JSON.stringify(err) + "]");
			});
		}

		// START
		channelScope.content = {};
		channelScope.getContent($routeParams.key);
		//------
	}]);