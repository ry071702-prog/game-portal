import type { CSSProperties, ReactNode } from 'react'
import { cn } from '../lib/cn'
import { Header } from './Header'
import { Toaster } from './Toaster'

interface LayoutProps {
  children: ReactNode
  showBack?: boolean
  size?: 'narrow' | 'wide'
  /** 設定するとアンビエント発光がこの色を帯びる。ゲーム画面でジャンル色に。 */
  accent?: string
}

export function Layout({ children, showBack, size = 'narrow', accent }: LayoutProps) {
  // accent が来たら3つの発光を同系色に。未指定はゴールド/シアンの宇宙トーン。
  const ambientStyle = accent
    ? ({ '--orb-a': accent, '--orb-b': accent, '--orb-c': accent } as CSSProperties)
    : undefined
  const contentWidth = size === 'wide' ? 'max-w-5xl' : 'max-w-3xl'

  return (
    <div className="flex min-h-svh flex-col">
      <div className="ambient" aria-hidden style={ambientStyle}>
        <span className="orb orb-1" />
        <span className="orb orb-2" />
        <span className="orb orb-3" />
      </div>
      <Header showBack={showBack} />
      <main className={cn('relative z-10 mx-auto w-full flex-1 px-4 py-6 sm:py-8', contentWidth)}>
        {children}
      </main>
      <footer className="relative z-10 border-t border-accent/20 bg-[var(--bg-panel)] py-5 text-xs text-faint backdrop-blur-xl">
        <div
          className={cn(
            'mx-auto flex w-full flex-col gap-2 px-4 sm:flex-row sm:items-center sm:justify-between',
            contentWidth,
          )}
        >
          <span className="font-display tracking-wide text-fg">GAME PORTAL</span>
          <span>無料・登録不要で遊べるミニゲーム集</span>
        </div>
      </footer>
      <div className="grain" aria-hidden />
      <div className="scanlines" aria-hidden />
      <Toaster />
    </div>
  )
}
