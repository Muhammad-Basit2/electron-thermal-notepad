const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  printThermal: (content) => ipcRenderer.invoke('print-thermal', content)
});