const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const express = require('express');

let mainWindow;
let server;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), 'dist', 'index.html'));
  }
}

function startServer() {
  const expressApp = express();
  const distPath = path.join(app.getAppPath(), 'dist');
  expressApp.use(express.static(distPath));
  server = expressApp.listen(3000, '0.0.0.0', () => {
    console.log('Server running on port 3000');
  });
}

app.whenReady().then(() => {
  startServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (server) server.close();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});