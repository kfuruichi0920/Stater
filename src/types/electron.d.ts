/**
 * Electron API Type Definitions
 * Electron APIの型定義
 */

export interface ElectronAPI {
  platform: NodeJS.Platform
  send: (channel: string, data: any) => void
  receive: (channel: string, func: (...args: any[]) => void) => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
