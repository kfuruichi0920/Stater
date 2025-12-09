/**
 * Electron Main Process
 * メインプロセスはアプリケーションのライフサイクルを管理し、BrowserWindowを作成する
 */
const { app, BrowserWindow } = require('electron')
const path = require('path')

// 開発環境かどうかを判定
const isDev = process.env.NODE_ENV === 'development'

// メインウィンドウの参照を保持
let mainWindow: BrowserWindow | null = null

/**
 * メインウィンドウを作成する関数
 */
function createWindow() {
  // ブラウザウィンドウを作成
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      // プリロードスクリプトのパスを指定
      preload: path.join(__dirname, 'preload.cjs'),
      // Node.js統合を無効化(セキュリティのため)
      nodeIntegration: false,
      // コンテキスト分離を有効化(セキュリティのため)
      contextIsolation: true
    }
  })

  // 開発環境では開発サーバーのURLをロード、本番環境ではビルドされたファイルをロード
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    // 開発者ツールを自動的に開く
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // ウィンドウが閉じられたときの処理
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// アプリケーションの準備が完了したらウィンドウを作成
app.whenReady().then(() => {
  createWindow()

  // macOSでは、ドックアイコンをクリックしたときにウィンドウを再作成
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// すべてのウィンドウが閉じられたときの処理(macOS以外)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
