const os = require('os');
const pathway = require('path');
const url = require('url');
const sqlite3 = require('sqlite3').verbose();

var CONSTANTS = {
	DB_DIR: pathway.join(os.homedir(),".DistroSols"),
	TORRENT_DIR: pathway.join(os.homedir(),".DistroSols","torrents"),
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
}
var lookup_db = null;