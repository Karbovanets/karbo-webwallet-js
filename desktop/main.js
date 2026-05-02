const { app, BrowserWindow, ipcMain, shell } = require('electron');
const fs = require('fs');
const http = require('http');
const path = require('path');

const HOST = '127.0.0.1';
const PREFERRED_PORT = 45110;

let mainWindow = null;
let staticServer = null;

function emptyVault() {
  return {
    version: 2,
    activeWalletId: null,
    wallets: []
  };
}

function getStorageRoot() {
  return app.getPath('userData');
}

function getWalletsDir() {
  return path.join(getStorageRoot(), 'wallets');
}

function getVaultPath() {
  return path.join(getStorageRoot(), 'vault.json');
}

function validateWalletId(walletId) {
  if (typeof walletId !== 'string' || !/^wallet_[a-f0-9]{32}$/.test(walletId)) {
    throw new Error('Invalid wallet id');
  }
}

function getWalletPath(walletId) {
  validateWalletId(walletId);
  return path.join(getWalletsDir(), `wallet_${walletId}.karbowallet`);
}

async function ensureWalletStorageDirs() {
  await fs.promises.mkdir(getWalletsDir(), { recursive: true });
}

function sanitizeWalletMetadata(raw) {
  const now = new Date().toISOString();
  return {
    id: raw.id,
    name: typeof raw.name === 'string' && raw.name.trim() !== '' ? raw.name.trim() : 'Wallet',
    address: typeof raw.address === 'string' ? raw.address : '',
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : now,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : now,
    lastOpenedAt: typeof raw.lastOpenedAt === 'string' ? raw.lastOpenedAt : null,
    backupConfirmed: raw.backupConfirmed === true
  };
}

function normalizeVault(rawVault) {
  if (!rawVault || typeof rawVault !== 'object' || !Array.isArray(rawVault.wallets)) {
    return emptyVault();
  }

  const vault = emptyVault();
  vault.activeWalletId = typeof rawVault.activeWalletId === 'string' ? rawVault.activeWalletId : null;
  for (const rawRecord of rawVault.wallets) {
    if (!rawRecord || typeof rawRecord.id !== 'string') {
      continue;
    }
    try {
      validateWalletId(rawRecord.id);
      vault.wallets.push(sanitizeWalletMetadata(rawRecord));
    } catch (_error) {
      continue;
    }
  }

  if (vault.activeWalletId && !vault.wallets.some((wallet) => wallet.id === vault.activeWalletId)) {
    vault.activeWalletId = vault.wallets.length > 0 ? vault.wallets[0].id : null;
  }

  return vault;
}

async function readVaultFromDisk() {
  const vaultPath = getVaultPath();
  try {
    const data = await fs.promises.readFile(vaultPath, 'utf8');
    return normalizeVault(JSON.parse(data));
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function writeVaultMetadata(vault) {
  await ensureWalletStorageDirs();
  const metadataVault = normalizeVault(vault);
  await fs.promises.writeFile(getVaultPath(), JSON.stringify(metadataVault, null, 2), 'utf8');
}

async function saveVaultFromRenderer(rawVault) {
  await ensureWalletStorageDirs();
  const vault = emptyVault();
  vault.activeWalletId = typeof rawVault.activeWalletId === 'string' ? rawVault.activeWalletId : null;

  if (Array.isArray(rawVault.wallets)) {
    for (const rawRecord of rawVault.wallets) {
      if (!rawRecord || typeof rawRecord.id !== 'string') {
        continue;
      }
      validateWalletId(rawRecord.id);
      if (typeof rawRecord.encryptedWalletData === 'string') {
        await fs.promises.writeFile(getWalletPath(rawRecord.id), rawRecord.encryptedWalletData, 'utf8');
      }
      vault.wallets.push(sanitizeWalletMetadata(rawRecord));
    }
  }

  if (vault.activeWalletId && !vault.wallets.some((wallet) => wallet.id === vault.activeWalletId)) {
    vault.activeWalletId = vault.wallets.length > 0 ? vault.wallets[0].id : null;
  }

  await writeVaultMetadata(vault);
}

async function readWalletBlob(walletId) {
  const walletPath = getWalletPath(walletId);
  try {
    return await fs.promises.readFile(walletPath, 'utf8');
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

function registerKarboStorageIpc() {
  ipcMain.handle('karbo-storage:listWallets', async () => {
    return readVaultFromDisk();
  });

  ipcMain.handle('karbo-storage:loadWallet', async (_event, walletId) => {
    validateWalletId(walletId);
    return readWalletBlob(walletId);
  });

  ipcMain.handle('karbo-storage:saveWallet', async (_event, walletId, encryptedBlob, metadata, activeWalletId) => {
    validateWalletId(walletId);
    if (typeof encryptedBlob !== 'string') {
      throw new Error('Invalid encrypted wallet data');
    }

    await ensureWalletStorageDirs();
    await fs.promises.writeFile(getWalletPath(walletId), encryptedBlob, 'utf8');

    const vault = (await readVaultFromDisk()) || emptyVault();
    const cleanMetadata = sanitizeWalletMetadata(Object.assign({}, metadata || {}, { id: walletId }));
    const index = vault.wallets.findIndex((wallet) => wallet.id === walletId);
    if (index === -1) {
      vault.wallets.push(cleanMetadata);
    } else {
      vault.wallets[index] = cleanMetadata;
    }
    vault.activeWalletId = typeof activeWalletId === 'string' ? activeWalletId : walletId;
    await writeVaultMetadata(vault);
  });

  ipcMain.handle('karbo-storage:saveVault', async (_event, vault) => {
    await saveVaultFromRenderer(vault || emptyVault());
  });

  ipcMain.handle('karbo-storage:deleteWallet', async (_event, walletId) => {
    validateWalletId(walletId);
    const vault = (await readVaultFromDisk()) || emptyVault();
    vault.wallets = vault.wallets.filter((wallet) => wallet.id !== walletId);
    if (vault.activeWalletId === walletId) {
      vault.activeWalletId = vault.wallets.length > 0 ? vault.wallets[0].id : null;
    }
    try {
      await fs.promises.unlink(getWalletPath(walletId));
    } catch (error) {
      if (!error || error.code !== 'ENOENT') {
        throw error;
      }
    }
    await writeVaultMetadata(vault);
  });

  ipcMain.handle('karbo-storage:renameWallet', async (_event, walletId, name) => {
    validateWalletId(walletId);
    const vault = (await readVaultFromDisk()) || emptyVault();
    const record = vault.wallets.find((wallet) => wallet.id === walletId);
    if (!record) {
      throw new Error('Wallet not found');
    }
    record.name = typeof name === 'string' && name.trim() !== '' ? name.trim() : 'Wallet';
    record.updatedAt = new Date().toISOString();
    await writeVaultMetadata(vault);
  });

  ipcMain.handle('karbo-storage:setActiveWalletId', async (_event, walletId) => {
    if (walletId !== null) {
      validateWalletId(walletId);
    }
    const vault = (await readVaultFromDisk()) || emptyVault();
    vault.activeWalletId = walletId;
    await writeVaultMetadata(vault);
  });

  ipcMain.handle('karbo-storage:exportWallet', async (_event, walletId) => {
    validateWalletId(walletId);
    return readWalletBlob(walletId);
  });
}

function getAppIconPath() {
  const appRoot = path.resolve(__dirname, '..');
  if (process.platform === 'win32') {
    return path.join(appRoot, 'src', 'assets', 'img', 'favicon.ico');
  }
  return path.join(appRoot, 'src', 'assets', 'img', 'logo.png');
}

function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.html': return 'text/html; charset=utf-8';
    case '.js': return 'application/javascript; charset=utf-8';
    case '.css': return 'text/css; charset=utf-8';
    case '.json': return 'application/json; charset=utf-8';
    case '.svg': return 'image/svg+xml';
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.ico': return 'image/x-icon';
    case '.woff': return 'font/woff';
    case '.woff2': return 'font/woff2';
    case '.ttf': return 'font/ttf';
    case '.eot': return 'application/vnd.ms-fontobject';
    default: return 'application/octet-stream';
  }
}

function writeFileResponse(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Internal server error');
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentTypeFor(filePath),
      'Cache-Control': 'no-cache'
    });
    res.end(data);
  });
}

function createStaticServer(rootDir) {
  return new Promise((resolve, reject) => {
    const normalizedRootDir = path.resolve(rootDir);

    const server = http.createServer((req, res) => {
      const requestUrl = new URL(req.url || '/', `http://${HOST}`);
      let pathname = decodeURIComponent(requestUrl.pathname || '/');

      if (pathname === '/') {
        pathname = '/index.html';
      }

      const normalizedPathname = pathname.replace(/\\/g, '/');
      let absolutePath = path.resolve(normalizedRootDir, `.${normalizedPathname}`);

      const inRootDir = absolutePath === normalizedRootDir
        || absolutePath.startsWith(`${normalizedRootDir}${path.sep}`);
      if (!inRootDir) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Forbidden');
        return;
      }

      if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isDirectory()) {
        absolutePath = path.join(absolutePath, 'index.html');
      }

      if (!fs.existsSync(absolutePath)) {
        const fallbackPath = path.join(rootDir, 'index.html');
        writeFileResponse(fallbackPath, res);
        return;
      }

      writeFileResponse(absolutePath, res);
    });

    const listenOnPort = (port) => {
      server.once('error', (error) => {
        if ((error.code === 'EADDRINUSE' || error.code === 'EACCES') && port === PREFERRED_PORT) {
          listenOnPort(0);
          return;
        }
        reject(error);
      });

      server.listen(port, HOST, () => {
        resolve(server);
      });
    };

    listenOnPort(PREFERRED_PORT);
  });
}

async function createMainWindow() {
  const appRoot = path.resolve(__dirname, '..');
  const webRoot = path.join(appRoot, 'src');

  staticServer = await createStaticServer(webRoot);
  const address = staticServer.address();
  const port = typeof address === 'object' && address ? address.port : 0;

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 880,
    minWidth: 600,
    minHeight: 720,
    backgroundColor: '#0B1F3B',
    autoHideMenuBar: true,
    icon: getAppIconPath(),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  const appUrl = `http://${HOST}:${port}/index.html#!index`;

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error(`[did-fail-load] ${errorCode} ${errorDescription} ${validatedURL}`);
  });

  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    console.log(`[renderer:${level}] ${message} (${sourceId}:${line})`);
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(`http://${HOST}:${port}/`)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  await mainWindow.loadURL(appUrl);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (staticServer) {
    staticServer.close();
    staticServer = null;
  }
});

app.whenReady().then(async () => {
  app.setAppUserModelId('org.karbo.wallet');
  registerKarboStorageIpc();

  if (process.platform === 'darwin' && app.dock) {
    app.dock.setIcon(getAppIconPath());
  }

  await createMainWindow();

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createMainWindow();
    }
  });
});
