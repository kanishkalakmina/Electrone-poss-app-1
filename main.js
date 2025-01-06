const express = require('express');
const { app, BrowserWindow, protocol } = require('electron')
const path = require('path')
const sqlite3 = require('sqlite3').verbose()
const productApi = require('./productApi') // Ensure this path is correct

const db = new sqlite3.Database(path.join(__dirname, 'PossApp.db'), (err) => {
    if(err){
        console.error('Database connection failed:', err.message);
    } else {
        console.log('Database connection successful');
    }
});

const server = express();
const PORT = 3000; // You can specify any port you want

// Middleware to parse JSON requests
server.use(express.json());

// Use the product API routes
server.use('/api', productApi); // Prefix your API routes with /api

// Start the server
server.listen(PORT, () => {
    console.log(`API server is running on http://localhost:${PORT}`);
});

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    // Register protocol for serving local files
    protocol.registerFileProtocol('local', (request, callback) => {
        const filePath = path.join(__dirname, request.url.slice('local://'.length))
        callback(filePath)
    })

    win.loadFile('index.html')
}

app.whenReady().then(() => {
    protocol.registerFileProtocol('file', (request, callback) => {
        const pathname = decodeURIComponent(request.url.replace('file:///', ''))
        callback(pathname)
    })
    
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})