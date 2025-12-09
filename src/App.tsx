/**
 * Main Application Component
 * アプリケーションのルートコンポーネント
 */
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Stater</h1>
        <p>State Transition Modeling and Simulation Tool</p>
      </header>
      <main className="app-main">
        <p>プロジェクト初期化完了。開発環境が正常に動作しています。</p>
        <p>Platform: {window.electronAPI?.platform || 'Unknown'}</p>
      </main>
    </div>
  )
}

export default App
