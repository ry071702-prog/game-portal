import type { ReactNode } from 'react'
import { cn } from '../lib/cn'
import { Footer } from './Footer'
import { Header } from './Header'
import { Toaster } from './Toaster'

interface LayoutProps {
  children: ReactNode
  showBack?: boolean
  size?: 'narrow' | 'wide'
}

export function Layout({ children, showBack, size = 'narrow' }: LayoutProps) {
  const contentWidth = size === 'wide' ? 'max-w-7xl' : 'max-w-4xl'

  return (
    <div className="flex min-h-svh flex-col bg-bg-base">
      <Header showBack={showBack} />
      <main className={cn('relative z-10 mx-auto w-full flex-1 px-4 py-5 sm:py-8', contentWidth)}>
        {children}
      </main>
      <Footer size={size} />
      <Toaster />
    </div>
  )
}
