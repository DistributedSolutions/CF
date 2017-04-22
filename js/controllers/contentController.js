angular.module("CFApp")
.controller("contentController",["$scope", "$routeParams", "$http", "jsonRPCService", "$log", "$interval",
	function($scope, $routeParams, $http, jsonRPCService, $log, $interval) {
		var contentScope = $scope;
		var updatePromise;

		//for now just using luie as a proof of concept
		contentScope.getStreamContentStat = function(hash) {
			var rpc = jsonRPCService.getJsonRpc(jsonRPCService.torrentStreamStatVal, hash);
			$http(rpc)
			.then((res) => {
				if (res.data.error) {
					//error in rpc
					$log.error("contentController: Error retrieving stream data: [" + hash + "] error: [" + JSON.stringify(res.data.error) + "]");
				} else {
					//success
					$log.info("contentController: Success in retrieving stream data: [" + res.data + "]");
					contentScope.streamFiles = res.data.result.files;
				}
			}, (res) => {
				//error on call SHOULD NEVER HAPPEN
				$log.error("contentController: Error: [" + JSON.stringify(err) + "]");
			});
		}

		//used to test luie download
		contentScope.testor = function() {
			//luie hash
			var hash = "eb5156f0f92001c5897064072953a9ccd5b00556";
			contentScope.getStreamContentStat(hash);
		}

		contentScope.$on('$destroy', function() {
			contentScope.stop();
		});

		//-START-
		contentScope.content = {};
		jsonRPCService.getContent($routeParams.key, (result) => {
			contentScope.content = result;
			contentScope.contentString = JSON.stringify(result, null, 2);
		});
		//USED FOR TESTING
		contentScope.testor();
		$interval(contentScope.testor, 2500);
		//-------
	}]);