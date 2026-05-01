const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('karboStorage', {
  listWallets() {
    return ipcRenderer.invoke('karbo-storage:listWallets');
  },
  loadWallet(walletId) {
    return ipcRenderer.invoke('karbo-storage:loadWallet', walletId);
  },
  saveWallet(walletId, encryptedBlob, metadata, activeWalletId) {
    return ipcRenderer.invoke('karbo-storage:saveWallet', walletId, encryptedBlob, metadata, activeWalletId);
  },
  deleteWallet(walletId) {
    return ipcRenderer.invoke('karbo-storage:deleteWallet', walletId);
  },
  renameWallet(walletId, name) {
    return ipcRenderer.invoke('karbo-storage:renameWallet', walletId, name);
  },
  setActiveWalletId(walletId) {
    return ipcRenderer.invoke('karbo-storage:setActiveWalletId', walletId);
  },
  saveVault(vault) {
    return ipcRenderer.invoke('karbo-storage:saveVault', vault);
  },
  exportWallet(walletId) {
    return ipcRenderer.invoke('karbo-storage:exportWallet', walletId);
  }
});
