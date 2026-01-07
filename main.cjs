const { app, BrowserWindow, protocol } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let serverProcess;

function startServer() {
    if (process.env.IS_ELECTRON) {
        // In dev mode, we assume the server is already running via 'npm run dev'
        return;
    }

    // In production, start the bundled express server
    const serverPath = path.join(__dirname, 'dist/index.cjs');
    const { fork } = require('child_process');

    serverProcess = fork(serverPath, [], {
        env: {
            ...process.env,
            NODE_ENV: 'production',
            PORT: '5050',
            IS_ELECTRON: 'true'
        },
        stdio: 'pipe'
    });

    if (serverProcess.stdout) serverProcess.stdout.on('data', (data) => console.log(`Server: ${data}`));
    if (serverProcess.stderr) serverProcess.stderr.on('data', (data) => console.error(`Server Error: ${data}`));

    serverProcess.on('exit', (code) => {
        if (code !== 0) {
            const { dialog } = require('electron');
            dialog.showErrorBox('Server Error', `Backend server exited with code ${code}. Check console.`);
        }
    });
}

function createWindow() {
    // 1. Create Splash Window
    const splash = new BrowserWindow({
        width: 400,
        height: 300,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        icon: path.join(__dirname, 'client/public/favicon.ico'),
        title: "المحاسب الذكي"
    });

    splash.loadFile('splash.html');
    splash.center();

    // 2. Create Main Window (Hidden initially)
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        show: false, // Keep hidden until loaded
        icon: path.join(__dirname, 'client/public/favicon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        title: "المحاسب الذكي",
        autoHideMenuBar: true,
        backgroundColor: '#f0f9ff' // Match splash bg
    });

    win.maximize();

    const loadApp = () => {
        const url = process.env.IS_ELECTRON_DEV
            ? 'http://localhost:5000'
            : 'http://localhost:5050';

        win.loadURL(url)
            .then(() => {
                // Verify main content is ready
                win.show();
                splash.destroy();
            })
            .catch((e) => {
                console.log("Retrying connection...");
                setTimeout(loadApp, 1000);
            });
    };

    // Retry connection logic for production
    if (!process.env.IS_ELECTRON_DEV) {
        let attempts = 0;
        const checkServer = setInterval(() => {
            const { net } = require('electron');
            const request = net.request('http://localhost:5050/api/auth/login');
            request.on('response', () => {
                clearInterval(checkServer);
                loadApp();
            });
            request.on('error', (error) => {
                attempts++;
                if (attempts > 15) { // Give it 15 seconds max
                    clearInterval(checkServer);
                    // If everything fails, show main window anyway so user sees error
                    splash.destroy();
                    win.show();
                    win.loadURL('data:text/html;charset=utf-8,<h1>Server Failed to Start</h1>');
                }
            });
            request.end();
        }, 1000);
    } else {
        loadApp();
    }
}

app.whenReady().then(() => {
    // Distinguish dev vs prod
    // In 'npm run desktop:dev', we pass IS_ELECTRON=true. 
    // In packaged app, process.env.IS_ELECTRON is usually undefined unless set.
    // We'll use a new var IS_ELECTRON_DEV for the 'dev' script.

    if (!process.env.IS_ELECTRON) { // If undefined, we are likely in prod executable
        startServer();
    }
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (serverProcess) serverProcess.kill();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('quit', () => {
    if (serverProcess) serverProcess.kill();
});
