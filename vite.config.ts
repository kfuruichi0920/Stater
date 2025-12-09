import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Electron統合は後で対応
    // electron([
    //   {
    //     // Main process entry point
    //     entry: 'electron/main.ts',
    //     vite: {
    //       build: {
    //         outDir: 'dist-electron',
    //         rollupOptions: {
    //           external: ['electron'],
    //           output: {
    //             format: 'cjs',
    //             entryFileNames: '[name].cjs'
    //           }
    //         }
    //       }
    //     }
    //   },
    //   {
    //     // Preload script
    //     entry: 'electron/preload.ts',
    //     onstart(options) {
    //       // Notify the renderer process of the preload script rebuild
    //       options.reload()
    //     },
    //     vite: {
    //       build: {
    //         outDir: 'dist-electron',
    //         rollupOptions: {
    //           external: ['electron'],
    //           output: {
    //             format: 'cjs',
    //             entryFileNames: '[name].cjs'
    //           }
    //         }
    //       }
    //     }
    //   }
    // ]),
    // renderer()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173
  }
})
