import { Monitor, Sun, Moon } from 'lucide-react'
import { useTheme, type Theme } from '../lib/theme'

const NEXT: Record<Theme, Theme> = { system: 'light', light: 'dark', dark: 'system' }
const ICON = { system: Monitor, light: Sun, dark: Moon }
const LABEL = { system: 'システム', light: 'ライト', dark: 'ダーク' }

/** クリックで システム→ライト→ダーク を循環するテーマ切替ボタン。 */
export function ThemeToggle() {
  const [theme, setTheme] = useTheme()
  const Icon = ICON[theme]
  return (
    <button
      onClick={() => setTheme(NEXT[theme])}
      className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-gray-300 hover:bg-white/10 hover:text-cyan-300"
      title={`テーマ: ${LABEL[theme]} (クリックで切替)`}
      aria-label={`テーマ切替 (現在: ${LABEL[theme]})`}
    >
      <Icon size={16} />
      <span className="hidden sm:inline">{LABEL[theme]}</span>
    </button>
  )
}
