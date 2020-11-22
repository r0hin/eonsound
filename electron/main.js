const { app, BrowserWindow } = require('electron')
const path = require('path');
const url = require('url');
const DiscordRPC = require('discord-rpc')
ipc = require('electron').ipcMain;

ipc.on('invokeAction', function(event, data){
  // DISCORD RICH PRESENCE

  if (data == 'queueDidEnd') {
    rpc.setActivity({
      details: `Idling`,
      state: `Waiting`,
      startTimestamp,
      largeImageKey: 'snek_large',
      largeImageText: 'EonSound',
      instance: false,
      startTimestamp: Math.round(Date.now() / 1000),
    });
  }
  else {
    rpc.setActivity({
      details: `Listening to ${data.split(';;').shift()}`,
      state: `by ${data.split(';;').pop()}`,
      startTimestamp,
      largeImageKey: 'snek_large',
      largeImageText: 'EonSound',
      instance: false,
      startTimestamp: Math.round(Date.now() / 1000),
    });
  }



});

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 950,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true
    },
    titleBarStyle: "hiddenInset",
  })

  // and load the index.html of the app.
  win.loadURL('http://localhost:6968/')

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    app.quit()
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// Set this to your Client ID.
const clientId = '780204397807403059';

// Only needed if you want to use spectate, join, or ask to join
DiscordRPC.register(clientId);

const rpc = new DiscordRPC.Client({ transport: 'ipc' });
const startTimestamp = new Date();

async function setActivity() {
  if (!rpc || !win) {
    return;
  }

  rpc.setActivity({
    details: `Idling`,
    state: `Waiting`,
    startTimestamp,
    largeImageKey: 'snek_large',
    largeImageText: 'EonSound',
    instance: false,
    startTimestamp: Math.round(Date.now() / 1000),
  });
}

rpc.on('ready', () => {
  console.log('READYY');
  setActivity();
});

rpc.login({ clientId }).catch(console.error);