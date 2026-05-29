import type { ReactNode } from 'react'
import { Header } from './Header'

interface LayoutProps {
  children: ReactNode
  showBack?: boolean
}

export function Layout({ children, showBack }: LayoutProps) {
  return (
    <div className="flex min-h-svh flex-col">
      <Header showBack={showBack} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">{children}</main>
      <footer className="border-t border-white/10 py-4 text-center text-xs text-gray-500">
        Game Portal — 無料・登録不要で遊べるミニゲーム集
      </footer>
    </div>
  )
}
