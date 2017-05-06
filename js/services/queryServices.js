const os = require('os');
const path = require('path');
const url = require('url');
const sqlite3 = require('sqlite3').verbose();

var DIR_CONSTANTS = {
	HOME : os.homedir(),
	PRIVATE_DIR : '.DistroSols'
}

var DB_CONSTANTS = {
	INTERFACE_DB : { 
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
	LOCAL_DB : {
		dbName : 'local.db',
		tableNames : {
			profiles : 'profiles',
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

const {ipcRenderer} = require('electron');
ipcRenderer.on('historyForward', (event, torrent) => {
	console.log("History Forward");
	window.history.forward();
});
ipcRenderer.on('historyBack', (event, torrent) => {
	console.log("History Back");
	window.history.back();
});

angular.module("CFApp")
	.service("interfaceDBService",["$rootScope", "$log",
		function($rootScope, $log) {
			console.log("Starting interfaceDB service");
			var interfaceDB = this;
			//setup of interfaceDB
			interfaceDB.channelTags = [];
			interfaceDB.contentTags = [];
			//--------------------


			interfaceDB.loadChannelTags = function(fn){
				var loadScope = this;
				interfaceDB.db.serialize(function(){
					interfaceDB.db.all("SELECT * FROM " + DB_CONSTANTS.INTERFACE_DB.tableNames.channelTag,function(err, rows) {
						if(err === null) {
							$log.log("Successfully querried channel tags");
						} else {
							$log.error("interfaceDBService: Error querrying channel tags [" + JSON.stringify(err) + "]");
						}
						return fn(rows);
					});
				});
			}

			interfaceDB.loadContentTags = function(fn) {
				interfaceDB.db.all("SELECT * FROM " + DB_CONSTANTS.INTERFACE_DB.tableNames.channelTag,function(err, rows) {
					interfaceDB.contentTags = interfaceDB.db.all("SELECT * FROM " + DB_CONSTANTS.INTERFACE_DB.tableNames.contentTag, function(err,rows) {
						if(err === null) {
							$log.log("Successfully querried content tags");
						} else {
							$log.error("InterfaceDBService: Error querrying content tags [" + JSON.stringify(err) + "]");
						}
						if (fn) {
							return fn(rows);	
						}
					});
				});
			}

			interfaceDB.getTopChannelsForTag = function(tagId, fn) {
				var s = "SELECT c.channelHash AS hash FROM " + DB_CONSTANTS.INTERFACE_DB.tableNames.channel + " AS c " +
						"INNER JOIN " + DB_CONSTANTS.INTERFACE_DB.tableNames.channelTagRel + " AS cTR ON cTR.c_id = c.channelHash " +
						"WHERE cTR.ct_id = ?"
				interfaceDB.db.all(s, tagId,function(err, rows) {
					if(err === null) {
						$log.log("Successfully querried top channels");
					} else {
						$log.error("InterfaceDBService: Error querrying top channel for tags [" + JSON.stringify(err) + "] with query [" + s + "]");
					}
					if (fn) {
						return fn(rows);
					}
				});
			}

			interfaceDB.getTopContentsForTag = function(tagId, fn) {
				var s = "SELECT c.contentHash AS hash FROM " + DB_CONSTANTS.INTERFACE_DB.tableNames.content + " AS c " +
						"INNER JOIN " + DB_CONSTANTS.INTERFACE_DB.tableNames.contentTagRel + " AS cTR ON cTR.c_id = c.contentHash " +
						"WHERE cTR.ct_id = ?"
				interfaceDB.db.all(s, tagId,function(err, rows) {
					if(err === null) {
						$log.log("Successfully querried top contents");
					} else {
						$log.error("InterfaceDBService: Error querrying top content for tags [" + JSON.stringify(err) + "] with query [" + s + "]");
					}
					if (fn) {
						return fn(rows);
					}
				});
			}

			interfaceDB.channelChange = function() {
				return interfaceDB.channelTags;
			}

			interfaceDB.contentChange = function() {
				return interfaceDB.contentTags;
			}

			interfaceDB.init = function() {
				interfaceDB.db = createDB(DB_CONSTANTS.INTERFACE_DB.dbName, sqlite3.OPEN_READONLY);
				interfaceDB.loadChannelTags((rows) => {
					$log.log("ChannelTags: " + JSON.stringify(rows));
					interfaceDB.channelTags = rows;	
					$rootScope.$apply();
				});
				interfaceDB.loadContentTags((rows) => {
					$log.log("ContentTags: " + JSON.stringify(rows));
					interfaceDB.contentTags = rows;
					$rootScope.$apply();
				});
				$log.info("Finished init for interface.")
			}
		}]);

angular.module("CFApp")
	.service("localDBService",["$rootScope", "$log",
		function($rootScope, $log) {
			console.log("Starting localDB service");
			var localDBScope = this;
			//setup of localDB
			//--------------------

			localDBScope.saveProfile = function(user, fn) {
				if (user.data == null) {
					user.data = {};
				}
				if (user.username == null) {
					$log.error("ERROR adding profile, no username given.");
					return;
				}
				localDBScope.db.run("INSERT OR REPLACE INTO " + DB_CONSTANTS.LOCAL_DB.tableNames.profiles + " (username,data) VALUES(?,?)", 
						user.username, JSON.stringify(user.data), (err) => {
					if(err) {
						$log.error("localDBService: Error saveProfile to localDB [" + JSON.stringify(err) + "]");
					}
					if(fn) {
						fn();
					}
				});
			}

			localDBScope.loadProfile = function(username, fn) {
				if(!username) {
					$log.error("localDBService: username has bad value [" + username + "]");
				}
				var s = "SELECT * FROM " + DB_CONSTANTS.LOCAL_DB.tableNames.profiles + " WHERE username = ?";
				localDBScope.db.get(s, username, function(err, row) {
					if(err === null) {
						$log.log("Successfully querried localDB profile");
					} else {
						$log.error("localDBService: Error querrying profile [" + JSON.stringify(err) + "] with querry [" + s + "]");
					}
					if (fn) {
						return fn(row);	
					}
				});
			}

			localDBScope.loadAllProfiles = function(fn) {
				var s = "SELECT * FROM " + DB_CONSTANTS.LOCAL_DB.tableNames.profiles;
				localDBScope.db.all(s,function(err, rows) {
					if(err === null) {
						$log.log("Successfully querried localDB Profiles");
					} else {
						$log.error("localDBService: Error querrying profiles [" + JSON.stringify(err) + "] with querry [" + s + "]");
					}
					if (fn) {
						return fn(rows);	
					}
				});
			}

			localDBScope.setUpTables = function() {
				localDBScope.db.run("CREATE TABLE IF NOT EXISTS " + DB_CONSTANTS.LOCAL_DB.tableNames.profiles + " (username CHAR(100) PRIMARY KEY, data TEXT);", (err) => {
					if(err) {
						$log.error("localDBService: Error creating localDB table. [" + JSON.stringify(err) + "]");
					}
				});

			}

			localDBScope.init = function() {
				localDBScope.db = createDB(DB_CONSTANTS.LOCAL_DB.dbName, sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE);
				localDBScope.setUpTables();
				$log.info("Finished init for localDB.")
			}
		}]);

angular.module("CFApp")
	.service("jsonRPCService",["$rootScope", "$http", "$log", 
		function($rootScope, $http, $log) {
			var jsonRpcScope = this;
			jsonRpcScope.id = 0;
			//--- INIT STATICS
			jsonRpcScope.hostApi = "http://localhost:8080/api";

			jsonRpcScope.getChannelVal = "get-channel";
			jsonRpcScope.getChannelsVal = "get-channels";
			jsonRpcScope.getContentVal = "get-content";
			jsonRpcScope.getContentsVal = "get-contents";
			jsonRpcScope.verifyChannelVal = "verify-channel";
			jsonRpcScope.submitChannelVal = "submit-channel";
			jsonRpcScope.torrentStreamStatVal = "get-torrent-stream-stats";
			//-----------

			jsonRpcScope.getContent = function(hash, fn) {
				if (hash) {
					var rpc = jsonRpcScope.getJsonRpc(jsonRpcScope.getContentVal, hash);
					$http(rpc)
					.then((res) => {
						if (res.data.error) {
							//error in rpc
							$log.error("jsonRPCService: Error content hash: [" + hash + "] error: [" + JSON.stringify(res.data.error) + "]");
						} else {
							//success
							$log.info("jsonRPCService: Success in content for res data: [" + res.data + "]");
							if (fn) {
								fn(res.data.result);
							}
						}
					}, (res) => {
						//error on call SHOULD NEVER HAPPEN
						$log.error("jsonRPCService: Error: [" + JSON.stringify(err) + "]");
					});
				} else {
					$log.error("jsonRPCService: hash not given");
				}
			}

			jsonRpcScope.getChannel = function(hash, fn) {
				if (hash) {
					var rpc = jsonRpcScope.getJsonRpc(jsonRpcScope.getChannelVal, hash);
					$http(rpc)
					.then((res) => {
						if (res.data.error) {
							//error in rpc
							$log.error("jsonRPCService: Error channel hash: [" + hash + "] error: [" + JSON.stringify(res.data.error) + "]");
						} else {
							//success
							$log.info("jsonRPCService: Success in channel for res data: [" + res.data + "]");
							if (fn) {
								fn(res.data.result);
							}
						}
					}, (res) => {
						//error on call SHOULD NEVER HAPPEN
						$log.error("jsonRPCService: Error: [" + JSON.stringify(err) + "]");
					});
				} else {
					$log.error("jsonRPCService: hash not given");
				}
			}

			jsonRpcScope.getJsonRpc = function(method, params) {
				var rpc = JSON.stringify({
					jsonrpc: "2.0",
					id: jsonRpcScope.id++,
					method: method,
					params: params
				});
				// console.log("JSONRPC [" + rpc + "]")
				return {
					method: "POST",
					url: jsonRpcScope.hostApi,
					data: rpc,
					headers: {'Content-Type': 'application/json'}
				};
			}

			// jsonRPCScope.httpRequest = function(jsonRPC) {
			// 	return $http.
			// }
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