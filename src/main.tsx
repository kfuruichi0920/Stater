/**
 * React Application Entry Point
 * アプリケーションのエントリポイント
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Reactアプリケーションをルート要素にマウント
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
