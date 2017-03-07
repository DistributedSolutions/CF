const {app, BrowserWindow} = require('electron');
const pathway = require('path');
const url = require('url');
const os = require('os');
const log = require('./backend/log.js')

require('electron-context-menu')({
    prepend: (params, browserWindow) => [{
        label: 'Rainbow',
        // only show it when right-clicking images 
        visible: params.mediaType === 'image'
    }]
});

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
    log.log(log.INFO, "App Ready!");
    createWindow();
  }
  log.log(log.INFO, "App Ready DONE! [" + win + "]");
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

//IPCMAIN
const {ipcMain} = require('electron');

// ipcMain.on('get-all-torrents', (event) => {
//     event.sender.send('get-all-torrents-reply', tempR);
// });