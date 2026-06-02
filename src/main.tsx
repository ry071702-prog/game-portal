import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// デプロイ直後などに遅延チャンクの読み込みが古いハッシュで失敗した場合、
// 一度だけ自動リロードして最新版を取得する (PWA + コード分割の定番対策)。
window.addEventListener('vite:preloadError', () => {
  if (!sessionStorage.getItem('gp-reloaded-once')) {
    sessionStorage.setItem('gp-reloaded-once', '1')
    window.location.reload()
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
