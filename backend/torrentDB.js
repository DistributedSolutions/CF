const os = require('os');
const pathway = require('path');
const url = require('url');
const sqlite3 = require('sqlite3').verbose();

var CONSTANTS = {
	DB_DIR: pathway.join(os.homedir(),".DistroSols"),
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
		},
		tableSchema: {
			torrent : "CREATE TABLE torrent (" +
				"infoHash CHAR(40) PRIMARY KEY," +
				"noPeersError BOOLEAN," + 
				"path VARCHAR(800)," + 
				"name VARCHAR(300)," + 
				"done BOOLEAN," + 
				"progress DECIMAL(10,9), " + 
				"received UNSIGNED BIG INT, " +
				"torrentFile BLOB);",
		}
	}
}
var torrent_db = null;

module.exports = {
	initDB: function(fn) {
		if (torrent_db === null) {
			console.log("-----Setting up db");
			console.log("Creating/opening DB here [" + pathway.join(CONSTANTS.DB_DIR, CONSTANTS.TORRENT_DB.dbName) + "]");
			torrent_db = new sqlite3.Database(pathway.join(CONSTANTS.DB_DIR, CONSTANTS.TORRENT_DB.dbName), (sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE), (err) => {
				if(err) {
					console.log("CREATEDB: Error creating/opening DB [" + JSON.stringify(err) + "]");
				} else {
					console.log("Successfully created/opened DB with name [" + CONSTANTS.TORRENT_DB.dbName + "] and mode [" + (sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE) + "]");
					var s = "SELECT COUNT(name) AS c FROM sqlite_master WHERE type='table' AND name='" + CONSTANTS.TORRENT_DB.tableNames.torrent + "';"
					torrent_db.get(s, (err, row) => {
						console.log("SetupDB: Rows returned on start [" + JSON.stringify(row) + "]");
						if(err) {
							console.log("SetupDB: Error retrieving if db exists [" + JSON.stringify(err) + "]");
						} else if (row.c != 1) {
							console.log("SetupDB: Creating torrent table");
							torrent_db.exec(CONSTANTS.TORRENT_DB.tableSchema.torrent, function(err) {
								if(err) {
									console.log("SetupDB: Error creating torrent table [" + JSON.stringify(err) + "] [" + CONSTANTS.TORRENT_DB.tableSchema.torrent + "]");
								} else {
									fn();
								}
							});
						} else {
							console.log("SetupDB: row is [" + row.c + "]");
							fn();
						}
					});
				}
			});
		} else {
			console.log("----NOT SETTING UP DB");
		}
		console.log("----FINISHED SETTING UP DB");
	},
	getAllTorrents: function(fn) {
		var s = "SELECT * FROM " + CONSTANTS.TORRENT_DB.tableNames.torrent;
		torrent_db.all(s, (err, rows) => {
			if(err) {
				$log.error("TorrentDBService: Error loading table information [" + JSON.stringify(err) + "]");
			} else {
				fn(rows);
			}
		});
	},
	getTorrent: function(infoHash,fn) {
        var s = "SELECT * FROM " + CONSTANTS.TORRENT_DB.tableNames.torrent + 
			" WHERE infoHash = ?";
		torrent_db.get(s, infoHash, (err,row) => {
			if(err) {
				$log.error("TorrentDBService: Error checking if table row exists [" + JSON.stringify(err) + "]");
			} else {
				if(fn) {
					fn(row);
				}
			}
		});
    },
    addTorrent: function(torrent) {
		var s = "INSERT INTO " + CONSTANTS.TORRENT_DB.tableNames.torrent + 
			" (infoHash, name, path, done, progress) VALUES(?, ?, ?, ?, ?);";
		torrent_db.run(s, torrent.infoHash, torrent.name, torrent.path, torrent.done, torrent.progress, (err) => {
			if(err) {
				console.log("TorrentDBService: Error inserting hash into db [" + JSON.stringify(err) + "]");
			} else {
				console.log("TorrentDBService: Added in torrent to db [" + torrent.infoHash + "]");
			}
		});
    },
    errorTorrent: function(torrent) {
		var s = "UPDATE " + CONSTANTS.TORRENT_DB.tableNames.torrent + 
			" SET noPeersError = ? WHERE infoHash = ?;";
		torrent_db.run(s, true, torrent.infoHash, (err) => {
			if(err) {
				console.log("TorrentDBService: Error updating torrent [" + JSON.stringify(err) + "]");
			} else {
				console.log("TorrentDBService: Error torrent db infohash [" + torrent.infoHash + "]");
			}
		});
    },
    updateTorrent: function(torrent) {
		var s = "UPDATE " + CONSTANTS.TORRENT_DB.tableNames.torrent + 
			" SET name = ?, done = ?, progress = ?, received = ? WHERE infoHash = ?;";
		torrent_db.run(s, torrent.name, torrent.done, torrent.progress, torrent.received, torrent.infoHash, (err) => {
			if(err) {
				console.log("TorrentDBService: Error updating torrent [" + JSON.stringify(err) + "] query [" + s + "]");
			} else {
				// $log.debug("TorrentDBService: Updated torrent db infohash [" + torrent.infoHash + "]");
			}
		});
    },
    saveTorrentBlob: function(torrent) {
		var s = "UPDATE " + CONSTANTS.TORRENT_DB.tableNames.torrent + 
			" SET torrentFile = ? WHERE infoHash = ?;";
		torrent_db.run(s, torrent.torrentFile, torrent.infoHash, (err) => {
			if(err) {
				console.log("TorrentDBService: Error inserting torrent blob [" + JSON.stringify(err) + "]");
			} else {
				console.log("TorrentDBService: BLOB INSERTED");
				// $log.debug("TorrentDBService: Updated torrent db infohash [" + torrent.infoHash + "]");
			}
		});
    }
};