const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 950,
    height: 700,
    icon: path.join(__dirname, 'icon.png'),
    backgroundColor: '#1e1e1e',
    titleBarOverlay: {
      color: '#1e1e1e',
      symbolColor: '#ffffff'
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

ipcMain.handle('print-thermal', async (event, options) => {
  const { content, fontFamily, header, footer, logo, logoSize } = options;

  let printWindow = new BrowserWindow({
    show: false,
    webPreferences: { nodeIntegration: true }
  });

  const printHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=Dancing+Script:wght@600&family=Kalam:wght@700&family=Patrick+Hand&family=Roboto+Mono&display=swap" rel="stylesheet">
      <style>
        @page {
          margin: 0;
          size: 80mm auto;
        }
        body {
          font-family: ${fontFamily}, sans-serif;
          width: 72mm;
          margin: 0 auto;
          padding: 5px;
          font-size: 18px;
          line-height: 1.3;
          white-space: pre-wrap;
          color: #000000;
          background-color: #ffffff;
        }
        .logo {
          display: block;
          margin: 0 auto 10px auto;
          max-width: 100%;
          max-height: ${logoSize || 60}px;
          object-fit: contain;
          filter: grayscale(100%) contrast(200%);
        }
        .header {
          text-align: center;
          font-weight: bold;
          border-bottom: 1px dashed #000;
          padding-bottom: 5px;
          margin-bottom: 10px;
        }
        .footer {
          text-align: center;
          border-top: 1px dashed #000;
          margin-top: 10px;
          padding-top: 5px;
          font-size: 14px;
        }
        .timestamp {
          font-size: 11px;
          text-align: center;
          margin-top: 4px;
        }
      </style>
    </head>
    <body>
      ${logo ? `<img src="${logo}" class="logo" />` : ''}
      ${header ? `<div class="header">${header}</div>` : ''}
      <div>${content}</div>
      ${footer ? `<div class="footer">${footer}</div>` : ''}
      <div class="timestamp">${new Date().toLocaleString()}</div>
    </body>
    </html>
  `;

  await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(printHtml)}`);

  printWindow.webContents.print({
    silent: false,
    printBackground: true,
    margins: { marginType: 'none' }
  }, (success, failureReason) => {
    printWindow.close();
    if (!success) console.error('Print failed:', failureReason);
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});