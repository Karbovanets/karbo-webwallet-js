const { app, BrowserWindow, shell } = require('electron');
const fs = require('fs');
const http = require('http');
const path = require('path');

const HOST = '127.0.0.1';
const PREFERRED_PORT = 45110;

let mainWindow = null;
let staticServer = null;

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
      sandbox: false
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
