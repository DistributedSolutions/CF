// angular.module("CFApp")
// .controller("torrentController",["$scope", "$routeParams", "torrentService", "$log",
// 	function($scope, $routeParams, torrentService, $log){
// 		var torrentScope = $scope;

// 		torrentScope.setMoreInfo = function(infoHash) {
// 			var temp = $.grep(torrentScope.torrents, function(e){ 
// 				return e.infoHash == infoHash; 
// 			});
// 			if (temp !== null && temp.length > 0) {
// 				torrentScope.torrentInfo = temp[0]
// 			} else {
// 				torrentScope.$log.debug("Error retrieving value")
// 			}
// 		}

// 		torrentScope.addTorrent = function() {
// 			if (torrentScope.infoHash !== "") {
// 				torrentService.addNewTorrent(torrentScope.infoHash, function(torrent) {
// 					// torrentScope.$apply(() => {
// 					// 	torrentScope.torrents.push(torrent);
// 					// });
// 					$log.debug("TorrentController: added torrent successfully.");
// 				});
// 				torrentScope.infoHash = "";
// 			}
// 		}

// 		torrentScope.stopTorrent = function() {
// 			// torrentScope.torrentInfo.destroy(() => {
// 			// 	$log.debug("TorrentController: Stopped Torrent [" + torrentScope.torrentInfo.infoHash + "]");
// 			// });
// 			torrentService.pauseTorrent(torrentScope.torrentInfo);
// 		}

// 		torrentScope.restartTorrent = function() {
// 			// torrentService.addTorrent(torrentScope.torrentInfo.infoHash, false, function(torrent) {
// 			// 	$log.debug("TorrentController: added torrent successfully.");
// 			// });
// 			// torrentScope.torrentInfo.requestedLoad = true;
// 			torrentService.removeTorrent(torrentScope.torrentInfo);
// 		}

// 		torrentScope.init = function() {
// 			torrentScope.infoHash = "";
// 			torrentScope.torrentInfo = null;
// 			torrentScope.torrents = torrentService.torrents;
// 			torrentScope.$watch(() => {torrentScope.torrents}, function(newValue, oldValue){
// 				if(newValue) {
// 					torrentScope.torrents = newValue
// 				}
// 			});
// 		}

// 		torrentScope.init();
// 	}
// 	]);
angular.module("CFApp")
.controller("torrentController",["$scope", "$routeParams", "$log",
	function($scope, $routeParams, $log){
		var torrentScope = $scope;
		// torrentScope.torrents = torrentService.getTorrents();
		// torrentScope.$watch('torrentService.getTorrents()', function(newValue) {
		// 	if(newValue) {
		// 		torrentScope.torrents = newValue;
		// 	}
		// 	console.log("NEW VALUE [" + newValue + "]");
		// }, true);

		torrentScope.setMoreInfo = function(torrent) {
			// torrentScope.torrentInfo = torrent;
		}

		torrentScope.addNewTorrent = function() {
			// torrentService.addTorrent(torrentScope.infoHash);
		}

		torrentScope.addTorrent = function() {
			// torrentService.addTorrent(torrentScope.torrentInfo.infoHash);
		}

		torrentScope.stopTorrent = function() {
			// torrentService.stopTorrent(torrentScope.torrentInfo.infoHash);
		}
	}
	]);