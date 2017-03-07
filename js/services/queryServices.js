const os = require('os');
const path = require('path');
const url = require('url');
const sqlite3 = require('sqlite3').verbose();

var DIR_CONSTANTS = {
	HOME : os.homedir(),
	PRIVATE_DIR : '.DistroSols',
	TORRENT_DIR : 'torrents'
}

var DB_CONSTANTS = {
	LOOKUP_DB : { 
		dbName : 'sql.db',
		tableNames : {
			channel : 'channel',
			channelTag : 'channelTag',
			channelTagRel : 'channelTagRel',
			content : 'content',
			contentTag : 'contentTag',
			contentTagRel : 'contentTagRel',
			playlist : 'playlist',
			playlistContentRel : 'playlistContentRel'
		}
	},
	TORRENT_DB : {
		dbName : 'torrent.db',
		tableNames : {
			torrent : 'torrent',
		}
	}
}

var createDB = function(dbName, mode) {
	var dbFilename = ("file:" + path.join(DIR_CONSTANTS.HOME, DIR_CONSTANTS.PRIVATE_DIR, dbName)  + "?cache=shared")
	console.log("Creating/opening DB here [" + path.join(DIR_CONSTANTS.HOME, DIR_CONSTANTS.PRIVATE_DIR, dbName) + "]");
	var db = new sqlite3.Database(path.join(DIR_CONSTANTS.HOME, DIR_CONSTANTS.PRIVATE_DIR, dbName), mode, 
		function(err) {
			if(err) {
				console.log("CREATEDB: Error creating/opening DB [" + JSON.stringify(err) + "]");
			} else {
				console.log("Successfully created/opened DB with name [" + dbName + "] and mode [" + mode + "]");
			}
	});
	return db;
}

var closeDB = function(db) {
	db.closeDB(
		function(err) {
			if(err === null) {
				console.log("Successfully closed DB with name [" + dbName + "] and mode [" + mode + "]");
			} else {
				console.log("CLOSEDB: Error closing DB [" + JSON.stringify(err) + "]");
			}
		});
}

angular.module("CFApp")
	.service("interfaceDBService",["$rootScope",
		function($rootScope) {
			console.log("Starting querying service");
			var interfaceDB = this;
			//setup of interfaceDB
			interfaceDB.contentTags = [];
			interfaceDB.channelTags = [];
			//--------------------


			interfaceDB.loadChannelTags = function(fn){
				var loadScope = this;
				interfaceDB.db.serialize(function(){
					interfaceDB.db.all("SELECT * FROM " + DB_CONSTANTS.LOOKUP_DB.tableNames.channelTag,function(err, rows) {
						if(err === null) {
							console.log("Successfully querried channel tags");
						} else {
							console.log("interfaceDBService: Error querrying channel tags [" + JSON.stringify(err) + "]");
						}
						return fn(rows);
					});
				});
			}
			interfaceDB.loadContentTags = function(fn) {
				interfaceDB.db.all("SELECT * FROM " + DB_CONSTANTS.LOOKUP_DB.tableNames.channelTag,function(err, rows) {
					interfaceDB.contentTags = interfaceDB.db.all("SELECT * FROM " + DB_CONSTANTS.LOOKUP_DB.tableNames.contentTag, function(err,rows) {
						if(err === null) {
							console.log("Successfully querried content tags");
						} else {
							console.log("interfaceDBService: Error querrying content tags [" + JSON.stringify(err) + "]");
						}
						if (fn) {
							return fn(rows);	
						}
					});
				});
			}

			interfaceDB.channelChange = function() {
				return interfaceDB.channelTags;
			}

			interfaceDB.contentChange = function() {
				return interfaceDB.contentTags;
			}

			interfaceDB.init = function() {
				interfaceDB.db = createDB(DB_CONSTANTS.LOOKUP_DB.dbName, sqlite3.OPEN_READONLY);
				interfaceDB.loadChannelTags((rows) => {
					console.log("ChannelTags: " + JSON.stringify(rows));
					interfaceDB.channelTags = rows;
					$rootScope.$apply();
				});
				interfaceDB.loadContentTags((rows) => {
					console.log("ContentTags: " + JSON.stringify(rows));
					interfaceDB.contentTags = rows;
					$rootScope.$apply();
				});
			}
		}]);

// angular.module("CFApp")
// 	.service("torrentDBService", ["$log",
// 		function($log) {
// 			var torrentDBScope = this;
// 			torrentDBScope.initTables = function(fn) {
// 				var s = "SELECT COUNT(name) AS c FROM sqlite_master WHERE type='table' AND name='" + DB_CONSTANTS.TORRENT_DB.tableNames.torrent + "';"
// 				torrentDBScope.db.get(s, (err, row) => {
// 					$log.debug("Rows returned on start [" + JSON.stringify(row) + "]");
// 					if(err) {
// 						$log.error("TorrentDBService: Error retrieving if db exists [" + JSON.stringify(err) + "]");
// 					} else {
// 						if (row.c != 1) {
// 							$log.debug("Creating torrent table");
// 							var s = "CREATE TABLE " + DB_CONSTANTS.TORRENT_DB.tableNames.torrent + " (" +
// 								"infoHash CHAR(40) PRIMARY KEY," +
// 								"name VARCHAR(300)," + 
// 								"path VARCHAR(300)," + 
// 								"noPeersError BOOLEAN," + 
// 								"done BOOLEAN," + 
// 								"progress DECIMAL(10,9));";
// 							torrentDBScope.db.exec(s, function(err) {
// 									if(err) {
// 										$log.error("TorrentDBService: Error creating torrent table [" + JSON.stringify(err) + "]")
// 									} else {
// 										fn();
// 									}
// 								});
// 						} else {
// 							fn();
// 						}
// 					}
// 				});
// 			}

// 			torrentDBScope.getAllTorrents = function(fn) {
// 				var s = "SELECT * FROM " + DB_CONSTANTS.TORRENT_DB.tableNames.torrent;
// 				torrentDBScope.db.all(s, (err, rows) => {
// 					if(err) {
// 						$log.error("TorrentDBService: Error loading table information [" + JSON.stringify(err) + "]");
// 					} else {
// 						fn(rows);
// 					}
// 				});
// 			}

// 			torrentDBScope.torrentExists = function(infoHash,fn) {
// 				var s = "SELECT * FROM " + DB_CONSTANTS.TORRENT_DB.tableNames.torrent + 
// 					" WHERE infoHash = ?";
// 				torrentDBScope.db.serialize(function() {
// 					torrentDBScope.db.get(s, infoHash, (err,row) => {
// 						if(err) {
// 							$log.error("TorrentDBService: Error checking if table row exists [" + JSON.stringify(err) + "]");
// 						} else {
// 							fn(row);
// 						}
// 					});
// 				});
// 			}

// 			torrentDBScope.addTorrent = function(torrent) {
// 				var s = "INSERT INTO " + DB_CONSTANTS.TORRENT_DB.tableNames.torrent + 
// 					" (infoHash, name, path, done, progress) VALUES(?, ?, ?, ?, ?);";
// 				torrentDBScope.db.run(s, torrent.infoHash, torrent.name, torrent.path, torrent.done, torrent.progress, (err) => {
// 					if(err) {
// 						$log.error("TorrentDBService: Error inserting hash into db [" + JSON.stringify(err) + "]");
// 					} else {
// 						$log.debug("TorrentDBService: Added in torrent to db [" + torrent.infoHash + "]");
// 					}
// 				});
// 			}

// 			torrentDBScope.errorTorrent = function(torrent) {
// 				var s = "UPDATE " + DB_CONSTANTS.TORRENT_DB.tableNames.torrent + 
// 					" SET noPeersError = ? WHERE infoHash = ?;";
// 				torrentDBScope.db.run(s, true, torrent.infoHash, (err) => {
// 					if(err) {
// 						$log.error("TorrentDBService: Error updating torrent [" + JSON.stringify(err) + "]");
// 					} else {
// 						$log.debug("TorrentDBService: Error torrent db infohash [" + torrent.infoHash + "]");
// 					}
// 				});
// 			}

// 			torrentDBScope.updateTorrent = function(torrent) {
// 				var s = "UPDATE " + DB_CONSTANTS.TORRENT_DB.tableNames.torrent + 
// 					" SET done = ?, progress = ? WHERE infoHash = ?;";
// 				torrentDBScope.db.run(s, torrent.done, torrent.progress, torrent.infoHash, (err) => {
// 					if(err) {
// 						$log.error("TorrentDBService: Error updating torrent [" + JSON.stringify(err) + "]");
// 					} else {
// 						// $log.debug("TorrentDBService: Updated torrent db infohash [" + torrent.infoHash + "]");
// 					}
// 				});
// 			}

// 			torrentDBScope.init = function (fn) {
// 				torrentDBScope.db = createDB(DB_CONSTANTS.TORRENT_DB.dbName, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);
// 				torrentDBScope.initTables(fn);
// 			}
// 		}
// 		]);