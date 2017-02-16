const os = require('os');
const path = require('path');
const url = require('url');
const sqlite3 = require('sqlite3').verbose();

var DB_CONSTANTS = {
	DIR_HOME : os.homedir(),
	LOOKUP_DB : { 
		dbName : '.DistroSols/sql.db',
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
	}
}

var createDB = function(dbName, mode) {
	console.log("Creating/opening DB here [" + path.join(DB_CONSTANTS.DIR_HOME, dbName) + "]");
	var db = new sqlite3.Database(path.join(DB_CONSTANTS.DIR_HOME, dbName), mode, 
		function(err) {
			if(err === null) {
				console.log("Successfully created/opened DB with name [" + dbName + "] and mode [" + mode + "]");
			} else {
				console.log("Error creating/opening DB [" + err + "]");
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
				console.log("Error closing DB [" + err + "]");
			}
		});
}

angular.module("CFApp")
	.service("interfaceDBService",[
		function() {
			console.log("Starting querying service");
			var interfaceDB = this;

			interfaceDB.loadChannelTags = function(fn){
				var loadScope = this;
				interfaceDB.db.serialize(function(){
					interfaceDB.db.all("SELECT * FROM " + DB_CONSTANTS.LOOKUP_DB.tableNames.channelTag,function(err, rows) {
						if(err === null) {
							console.log("Successfully querried channel tags");
						} else {
							console.log("Error querrying channel tags [" + err + "]");
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
							console.log("Error querrying content tags [" + err + "]");
						}
						return fn(rows);
					});
				});
			}

			interfaceDB.init = function() {
				interfaceDB.db = createDB(DB_CONSTANTS.LOOKUP_DB.dbName, sqlite3.OPEN_READONLY);
			}
		}]);