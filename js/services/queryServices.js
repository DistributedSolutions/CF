const os = require('os');
const path = require('path');
const url = require('url');
const sqlite3 = require('sqlite3').verbose();
const low = require('lowdb')
const db = low(path.join(os.homedir(),'.DistroSols', 'appStorage.json'))

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
					$rootScope.$apply(() => {
						interfaceDB.channelTags = rows;	
					});
				});
				interfaceDB.loadContentTags((rows) => {
					$log.log("ContentTags: " + JSON.stringify(rows));
					$rootScope.$apply(() => {
						interfaceDB.contentTags = rows;
					});
				});
				$log.info("Finished init for interface.")
			}
		}]);

angular.module("CFApp")
.service("jsonRpcService",["$rootScope", "$http", "$log", 
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
			jsonRpcScope.createChannelVal = "create-channel";
			jsonRpcScope.updateChannelVal = "update-channel";
			jsonRpcScope.torrentStreamStatVal = "get-torrent-stream-stats";
			jsonRpcScope.postTorrentStreamSeekVal = "post-torrent-stream-seek";
			jsonRpcScope.getConstantsVal = "get-constants";
			//-----------

			jsonRpcScope.postTorrentStreamSeek = function(time) {
				if (time) {
					var rpc = jsonRpcScope.getJsonRpc(jsonRpcScope.postTorrentStreamSeekVal, time);
					$http(rpc)
					.then((res) => {
						if (res.data.error) {
							//error in rpc
							$log.error("jsonRpcService: postTorrentStreamSeek: Error: [" + JSON.stringify(res.data.error) + "]");
						} else {
							//success
							$log.info("jsonRpcService: postTorrentStreamSeek: Success.");
						}
					}, (res) => {
						//error on call SHOULD NEVER HAPPEN
						$log.error("jsonRpcService: Error: [" + JSON.stringify(err) + "]");
					});
				} else {
					$log.error("jsonRpcService: time not given");
				}
			}

			jsonRpcScope.getContent = function(hash, fn) {
				if (hash) {
					var rpc = jsonRpcScope.getJsonRpc(jsonRpcScope.getContentVal, hash);
					$http(rpc)
					.then((res) => {
						if (res.data.error) {
							//error in rpc
							$log.error("jsonRpcService: Error content hash: [" + hash + "] error: [" + JSON.stringify(res.data.error) + "]");
						} else {
							//success
							$log.info("jsonRpcService: Success in content for res data: [" + res.data + "]");
							if (fn) {
								fn(res.data.result);
							}
						}
					}, (res) => {
						//error on call SHOULD NEVER HAPPEN
						$log.error("jsonRpcService: Error: [" + JSON.stringify(err) + "]");
					});
				} else {
					$log.error("jsonRpcService: hash not given");
				}
			}

			jsonRpcScope.getChannel = function(hash, fn) {
				if (hash) {
					var rpc = jsonRpcScope.getJsonRpc(jsonRpcScope.getChannelVal, hash);
					$http(rpc)
					.then((res) => {
						if (res.data.error) {
							//error in rpc
							$log.error("jsonRpcService: Error channel hash: [" + hash + "] error: [" + JSON.stringify(res.data.error) + "]");
						} else {
							//success
							$log.info("jsonRpcService: Success in channel for res data: [" + res.data + "]");
							if (fn) {
								fn(res.data.result);
							}
						}
					}, (res) => {
						//error on call SHOULD NEVER HAPPEN
						$log.error("jsonRpcService: Error: [" + JSON.stringify(err) + "]");
					});
				} else {
					$log.error("jsonRpcService: hash not given");
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
		}]);

angular.module("CFApp")
.service("localDBService",["$rootScope", "$http", "$log", 
	function($rootScope, $http, $log) {
		var localDBScope = this;

		localDBScope.saveProfile = function(user, fn) {
			if(!user.username) {
				$log.error("localDBService: username has bad value [" + username + "]");
			}
			if (user.username == null) {
				$log.error("localDBService: ERROR adding profile, no username given.");
				return;
			}
			if (!db.get('users').find({ username : user.username}).value()) {
				db.get('users').push(user).write();
			} else {
				db.get('users').remove({ username : user.username}).write();
				db.get('users').push(user).write();
			}
			if(fn) {
				fn();
			}
		}

		localDBScope.loadProfile = function(username) {
			return db.get("users").find({username: username}).value();
		}

		localDBScope.loadAllProfiles = function() {
			return db.get('users').value();
		}

		localDBScope.setUpDb = function() {
			db.defaults({ users: []}).write()
		}

		localDBScope.setTorrentVideoStat = function(hash, time) {
			if (!db.get("users").find({username:username})
				.get("video")
				.find({hash: hash})) {
				db.get("users").find({username:username}).get("video").push({
					hash: hash,
					time: time
				}).write()
		} else {
			db.get("users").find({username:username}).get("video").assign({
				time: time
			}).write()
		}
	}

	localDBScope.getCurrentUser = function() {
		var cUser = db.get("currentUser").write();
		return localDBScope.loadProfile(cUser);
	}

	localDBScope.setCurrentUser = function(username) {
		db.set("currentUser", username).write();
	}

	localDBScope.init = function() {
		localDBScope.setUpDb();
		$log.info("Finished init for localDB.")
	}
}]);