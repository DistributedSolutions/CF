angular.module("CFApp")
.controller("contentController",["$scope", "$routeParams", "$http", "jsonRpcService", "$log", "$interval",
	function($scope, $routeParams, $http, jsonRpcService, $log, $interval) {
		var contentScope = $scope;
		var intervalPromise;

		//for now just using luie as a proof of concept
		contentScope.getStreamContentStat = function(hash) {
			var rpc = jsonRpcService.getJsonRpc(jsonRpcService.torrentStreamStatVal, hash);
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
			$interval.cancel(intervalPromise);
		});

		//-START-
		contentScope.content = {};
		jsonRpcService.getContent($routeParams.key, (result) => {
			contentScope.content = result;
			contentScope.contentString = JSON.stringify(result, null, 2);
		});
		//USED FOR TESTING
		contentScope.testor();
		intervalPromise = $interval(contentScope.testor, 2500);

		//used to updated torrent backend to prefer different location torrent
		var torrentVideo = document.getElementById("torrentVideo");
		torrentVideo.addEventListener('timeupdate', () => {
			jsonRpcService.postTorrentStreamSeek(torrentVideo.currentTime);
			localDBService.setTorrentVideoStat($routeParams.key, torrentVideo.currentTime);
		}, false);
		//-------

	}]);