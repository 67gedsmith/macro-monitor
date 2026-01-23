const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: true,
      spellcheck: false
    },
    icon: path.join(__dirname, 'icon.ico')
  });

  win.loadFile('index.html');
  
  // Handle IPC request to blur/focus window to wake up input system
  ipcMain.on('wake-input', () => {
    win.blur();
    setTimeout(() => {
      win.focus();
    }, 50);
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
