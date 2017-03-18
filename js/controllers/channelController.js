angular.module("CFApp")
.controller("channelController",["$scope", "$routeParams", "$http", "jsonRPCService", "$log",
	function($scope, $routeParams, $http, jsonRPCService, $log){
		var channelScope = $scope;

		channelScope.getChannel = function(channelKey) {
			var rpc = jsonRPCService.getJsonRpc(jsonRPCService.getChannel, channelKey);
			$http(rpc)
			.then((res) => {
				if (res.data.error) {
					//error in rpc
					$log.error("Error in channel request key: [" + channelKey + "] error: [" + JSON.stringify(res.data.error) + "]");
				} else {
					//success
					$log.info("Success in channel for res data: [" + res.data + "]");
					channelScope.channel = JSON.stringify(res.data, null, 2);
					// $log.info("YES [" +  + "]");
				}
			}, (res) => {
				//error on call SHOULD NEVER HAPPEN
				$log.error("Error in channel request key, error: [" + JSON.stringify(err) + "]");
			});
		}

		// START
		channelScope.channel = {};
		channelScope.getChannel($routeParams.key);
		//------
	}]);