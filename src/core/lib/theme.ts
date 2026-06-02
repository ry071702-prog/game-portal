// テーマ管理 (system/light/dark)。zustand を使わず localStorage 直管理で
// index.html のブートスクリプトと同じキーを共有し、初期描画のちらつきを防ぐ。
import { useEffect, useState } from 'react'

export type Theme = 'system' | 'light' | 'dark'

const KEY = 'gp-theme'

const mql = () =>
  typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null

export function getTheme(): Theme {
  const v = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null
  return v === 'light' || v === 'dark' || v === 'system' ? v : 'system'
}

export function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') return mql()?.matches ? 'dark' : 'light'
  return theme
}

export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', resolveTheme(theme) === 'dark')
}

export function setTheme(theme: Theme): void {
  localStorage.setItem(KEY, theme)
  applyTheme(theme)
  window.dispatchEvent(new CustomEvent('gp-theme-change'))
}

/** 現在のテーマを購読し、system 選択時は OS の切替にも追従する。 */
export function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, setLocal] = useState<Theme>(getTheme)

  useEffect(() => {
    const onChange = () => setLocal(getTheme())
    window.addEventListener('gp-theme-change', onChange)
    const m = mql()
    const onMedia = () => applyTheme(getTheme())
    m?.addEventListener('change', onMedia)
    // マウント時に現在値を再適用 (ストアとブート結果の整合)
    applyTheme(getTheme())
    return () => {
      window.removeEventListener('gp-theme-change', onChange)
      m?.removeEventListener('change', onMedia)
    }
  }, [])

  return [theme, setTheme]
}
