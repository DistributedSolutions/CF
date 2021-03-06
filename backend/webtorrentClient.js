// var WebTorrent = require('webtorrent');
// var client = new WebTorrent();

// const pathway = require('path');
// const fs = require('fs');

// var WebTorrent = require('webtorrent');
// var client = new WebTorrent();

// client.on("error", function(err) {
// 	console.log("CLIENT ERROR [" + JSON.stringify(err) + "]");
// });


// client.on("torrent", function(torrent) {
// 	console.log("CLIENT NEW TORRENT [" + torrent.infoHash + "]");
// });

// var TORRENTS_DIR = pathway.join(os.homedir(), '.DistroSols', 'torrents');

// angular.module("CFApp")
// .service("torrentService",["torrentDBService", "$log", "$rootScope",
// 	function(torrentDBService, $log, $rootScope) {
// 		console.log("Starting torrent service");
// 		var torrentScope = this;
// 		torrentScope.torrents = [];

// 		torrentScope.addNewTorrent = function(infoHash, fn) {
// 			if (infoHash.length !== 40) {
// 				$log.error("TorrentService: Invalid hash. length [" + infoHash.length + "]");
// 				return;
// 			}
// 			//check if infoHash exists
// 			torrentDBService.torrentExists(infoHash, (row) => {
// 					if(row == null) {
// 						torrentScope.addTorrent(infoHash, true, fn);
// 					} else {
// 						$log.debug("Info hash exist. NOT DOWNLOADING infoHash[" + infoHash + "]");
// 					}
// 				});
// 		}

// 		torrentScope.addTorrent = function(infoHash, newTorrent, fn) {
// 			//added torrent to db
// 			client.add(infoHash, {
// 				path : pathway.join(TORRENTS_DIR, infoHash)
// 			},
// 			function (torrent) {
// 					if(newTorrent) {
// 						torrentDBService.addTorrent(torrent);
// 					}
// 					if (torrent) {
// 						// Got torrent metadata! 
// 						$log.debug('TorrentService: Starting download of torrent with infoHash[' + infoHash + ']');

// 						torrent.on("download", function(bytes) {
// 							torrentScope.updateTorrent(torrent);
// 						});
// 						torrent.on("noPeers", function(announceType) {
// 							$log.error("TorrentService: No Peers Found for torrent [" + torrent.infoHash + "] announceType [" + announceType + "]");
// 							torrentDBService.errorTorrent(torrent);
// 							torrent.noPeersError = "noPeers";
// 						});
// 						torrent.on("error", (err) => {
// 							$log.error("TorrentService: Error with torrent [" + JSON.stringify(err) + "]");
// 						});
// 						torrent.on("done", function() {
// 							$log.debug("TorrentService: Done Downloading torrent [" + torrent.infoHash + "]");
// 							torrentDBService.updateTorrent(torrent);
// 						});
// 						if(newTorrent) {
// 							torrentScope.torrents.push(torrent);
// 						}
// 						if(fn) {
// 							fn(torrent);	
// 						}
// 					} else {
// 						$log.error('TorrentService: Torrent not created.')
// 					}
// 				});
// 		}

// 		//******ONLY TO BE CALLED ON RELOAD OF PAGE/RESTART OF APP IN FUTURE***********
// 		torrentScope.loadAllTorrents = function() {
// 			torrentDBService.getAllTorrents((rows) => {
// 				$.each(rows, function(index, row) {
// 					//add in all torrents
// 					if(row.done) {
// 						$rootScope.$apply(() => {
// 							torrentScope.torrents.push(row);
// 						});
// 					} else {
// 						torrentScope.addTorrent(row.infoHash, false, (torrent) => {
// 							$rootScope.$apply(() => {
// 								torrentScope.torrents.push(torrent);
// 							});
// 							$log.debug("TorrentScope: Succesfully added torrent from db on restart [" + torrent.infoHash + "]");
// 						});
// 					}
// 				});
// 			});
// 		}

// 		torrentScope.updateTorrent = function(torrent) {
// 			// $log.debug("TorrentService: length [" + torrentScope.torrents.length + "]")
// 			if(torrent) {
// 				torrentDBService.updateTorrent(torrent);
// 				$rootScope.$apply(() => {
// 					torrentScope.torrents;
// 				});
// 			} else {
// 				$log.error("TorrentService: error updating torrent give null/undefined value [" + torrent + "]");
// 			}
// 		}

// 		torrentScope.pauseTorrent = function(torrent) {
// 			client.get(torrent).pause();
// 		}

// 		torrentScope.removeTorrent = function(torrent) {
// 			client.get(torrent).resume();
// 		}

// 		torrentScope.init = function() {
// 			$log.info("TorrentService init.");
// 			torrentScope.loadAllTorrents();
// 		}
// 	}]);