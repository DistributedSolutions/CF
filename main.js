const {app, BrowserWindow} = require('electron');
const torrentDB = require('./backend/torrentDB.js');
const pathway = require('path');
const url = require('url');
const os = require('os');

require('electron-context-menu')({
    prepend: (params, browserWindow) => [{
        label: 'Rainbow',
        // only show it when right-clicking images 
        visible: params.mediaType === 'image'
    }]
});


var WebTorrent = require('webtorrent');
var client = new WebTorrent();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    title: "CF",
    width: 1200, 
    height: 1200,
    toolbar: false,
  })

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: pathway.join(__dirname, 'html', 'index.html'),
    protocol: 'file:',
    slashes: true
  }))
  // win.loadURL(`http://localhost:3333`);

  // Open the DevTools.
  // win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  if (win === undefined) {
    console.log("App Ready!");
    torrentDB.initDB(() => {
      createWindow();
      initAddAllTorrents();
    });
  }
  console.log("App Ready DONE! [" + win + "]");
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


var TORRENT_DIR = pathway.join(os.homedir(),".DistroSols","torrents");

function clientAddTorrent(infoHash, torrentFile) {
    var torrent;
    if(torrentFile) {
      console.log('Client-Add-Torrent: HAS TORRENT FILE');
      torrent = client.add(torrentFile, { path : pathway.join(TORRENT_DIR, infoHash) }, (torrent) => {

      });
    } else {
      console.log('Client-Add-Torrent: NO TORRENT FILE');
      torrent = client.add(infoHash, { path : pathway.join(TORRENT_DIR, infoHash) }, (torrent) => {

      });
    }
    console.log("Client-Add-Torrent: About to add torrent [" + torrent + "]");
    if (torrent) {
      torrent.on('warning', (err) =>
        console.log("Torrent-Object: warning [" + infoHash + "] :" + JSON.stringify(err.message)));
      torrent.on('error', (err) =>
        console.log("Torrent-Object: error [" + infoHash + "] :" + JSON.stringify(err.message)));
      torrent.on('ready', () => {
        console.log("Torrent-Object: ready [" + infoHash + "] [" + torrent.received + "] storing blob");
        if(!torrentFile) {
          //there is no torrent file, must save blob
          torrentDB.saveTorrentBlob(torrent);
        }
      });
      torrent.on('done', function() {
        console.log("Torrent-Object: done [" + infoHash + "]");
      });
      // Got torrent metadata! 
      console.log('Add-Torrent: Starting download of torrent with infoHash[' + infoHash + ']');
      torrent.on("download", function(bytes) {
        // console.log("Update-Torrent: [" + infoHash + "] [" + bytes + "] [" + Date() + ']');
        win.webContents.send("update-for-torrent", getTorrentData(torrent));
        torrentDB.updateTorrent(torrent);
      });
      torrent.on("noPeers", function(announceType) {
        console.log("Torrent-Object:  No Peers Found for torrent [" + torrent.infoHash + "] announceType [" + announceType + "]");
        // torrentDB.errorTorrent(torrent);
        win.webContents.send("noPeers-for-torrent", getTorrentData(torrent));
       });
      torrent.on("error", (err) => {
        console.log("Torrent-Object: Error with torrent [" + JSON.stringify(err) + "]");
        win.webContents.send("error-for-torrent", getTorrentData(torrent));
      });
      torrent.on("done", function() {
        console.log("Torrent-Object: Done Downloading torrent [" + torrent.infoHash + "]");
        torrentDB.updateTorrent(torrent);
        win.webContents.send("done-for-torrent", getTorrentData(torrent));
      });
      torrent.on("metadata", function() {
        console.log("Torrent-Object: metadata [" + torrent.magnetLink + "]");
      });
    } else {
      console.log('Client-Add-Torrent: Torrent not created!!!!!!!!!!!!!!!!');
    }
}


function addTorrent(infoHash) {
  if(infoHash) {
    infoHash = infoHash.toLowerCase();
  }
  torrentDB.getTorrent(infoHash, (row) => {
    console.log("Add-Torrent [" + infoHash + "]");
    if(row) {
      if(row.done) {
        console.log("Add-Torrent row is done [" + row.done + "] not adding.");
      } else {
        console.log("Add-Torrent row is not done [" + row.done + "] attempting to add again.");
        clientAddTorrent(infoHash, row.torrentFile);
      }
    } else {
      console.log("Add-Torrent torrent is new.");
      torrentDB.addTorrent({
        infoHash: infoHash, 
        path: pathway.join(TORRENT_DIR, infoHash)
      });
      clientAddTorrent(infoHash);
    }
  });
}

function initAddAllTorrents() {
  console.log("Init-Add-All-Torrents: Adding in torrents");
  torrentDB.getAllTorrents((rows) => {
    if (rows) {
      console.log("Init-Add-All-Torrents: in DB amount [" + rows.length + "]");
      var arr = [];
      for(var i = 0; i < rows.length; i++) {
        console.log("Init-Add-All-Torrents: Adding in torrent with infoHash [" + rows[i].infoHash + "]");
        addTorrent(rows[i].infoHash, rows[i].torrentFile);
      }
    } else {
      console.log("Init-Add-All-Torrents: No Torrents exist in DB");
    }
  });
}

function getTorrentData(torrent) {
  return {
    name: torrent.name,
    infoHash: torrent.infoHash,
    downloadSpeed: torrent.downloadSpeed,
    path: torrent.path,
    progress: torrent.progress,
    done : torrent.done,
    link : torrent.magnetURI
  }
}

app.on('add-torrent', (event, infoHash) => {
  console.log("Backend: add-torrent");
  addTorrent(infoHash);
});

//IPCMAIN
const {ipcMain} = require('electron');

ipcMain.on('get-all-torrents', (event) => {
  console.log("Backend: get-all-torrents");
  torrentDB.getAllTorrents((rows) => {
    var tempR = [];
    for(var i = 0; i < rows.length; i++) {
      tempR.push(getTorrentData(rows[i]));
    }
    event.sender.send('get-all-torrents-reply', tempR);
  });
});

ipcMain.on('stop-torrent', (event, infoHash) => {
  console.log("Backend: stop-torrent [" + infoHash + "]");
  const t = client.get(infoHash);
  if(t) {
    t.destroy();
  }
});

ipcMain.on('start-torrent', (event, infoHash) => {
  console.log("Backend: start-torrent [" + infoHash + "] [" + client.torrents.length + "]");
  addTorrent(infoHash);
});