/**
 * Electron Preload Script
 * レンダラープロセスとメインプロセス間の安全な通信を提供する
 * contextBridgeを使用してAPIを公開
 */
const { contextBridge, ipcRenderer } = require('electron')

// レンダラープロセスに公開するAPIを定義
const electronAPI = {
  // 将来的にファイルI/O、ダイアログ表示などのAPIを追加予定
  platform: process.platform,

  // IPC通信のサンプル(将来拡張)
  send: (channel: string, data: any) => {
    // ホワイトリストで許可されたチャンネルのみ送信可能
    const validChannels = ['toMain']
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },

  receive: (channel: string, func: (...args: any[]) => void) => {
    // ホワイトリストで許可されたチャンネルのみ受信可能
    const validChannels = ['fromMain']
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_event, ...args) => func(...args))
    }
  }
}

// contextBridgeを使用してAPIを安全に公開
contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// TypeScript型定義をグローバルに追加(後で src/types/electron.d.ts に移動予定)
declare global {
  interface Window {
    electronAPI: typeof electronAPI
  }
}
