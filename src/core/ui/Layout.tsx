import type { CSSProperties, ReactNode } from 'react'
import { Header } from './Header'
import { Toaster } from './Toaster'

interface LayoutProps {
  children: ReactNode
  showBack?: boolean
  /** 設定するとアンビエント(発光オーブ)がこの色を帯びる。ゲーム画面でジャンル色に。 */
  accent?: string
}

export function Layout({ children, showBack, accent }: LayoutProps) {
  // accent が来たら3つのオーブを同系色に。未指定はポータル既定(黄/琥珀/橙)。
  const ambientStyle = accent
    ? ({ '--orb-a': accent, '--orb-b': accent, '--orb-c': accent } as CSSProperties)
    : undefined

  return (
    <div className="flex min-h-svh flex-col">
      <div className="ambient" aria-hidden style={ambientStyle}>
        <span className="orb orb-1" />
        <span className="orb orb-2" />
        <span className="orb orb-3" />
      </div>
      <Header showBack={showBack} />
      <main className="relative z-10 mx-auto w-full max-w-3xl flex-1 px-4 py-6">{children}</main>
      <footer className="relative z-10 border-t border-line py-4 text-center text-xs text-faint">
        Game Portal — 無料・登録不要で遊べるミニゲーム集
      </footer>
      <div className="scanlines" aria-hidden />
      <Toaster />
    </div>
  )
}
