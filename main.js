const { app, BrowserWindow, protocol } = require('electron')
const path = require('path')

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