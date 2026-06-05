import { ExternalLink, Gamepad2 } from 'lucide-react'
import { cn } from '../lib/cn'

interface FooterProps {
  size?: 'narrow' | 'wide'
}

export function Footer({ size = 'narrow' }: FooterProps) {
  const contentWidth = size === 'wide' ? 'max-w-7xl' : 'max-w-4xl'
  const year = new Date().getFullYear()

  return (
    <footer className="relative z-10 border-t border-line bg-[#080b14]/85">
      <div
        className={cn(
          'mx-auto flex w-full flex-col gap-7 px-4 py-10 md:flex-row md:items-start md:justify-between',
          contentWidth,
        )}
      >
        <div className="flex max-w-sm items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-yellow to-cyan text-bg-base">
            <Gamepad2 size={20} />
          </span>
          <div>
            <p className="font-display text-lg uppercase text-fg">GAME PORTAL</p>
            <p className="mt-1 text-sm font-bold text-muted">Free mini games collection.</p>
            <p className="mt-4 text-xs font-bold text-faint">Copyright © {year} Game Portal.</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
          <nav className="flex flex-wrap gap-3 text-sm font-extrabold text-muted">
            <a className="focus-ring rounded-lg px-2 py-1 hover:text-fg" href="/#games">
              Games
            </a>
            <a className="focus-ring rounded-lg px-2 py-1 hover:text-fg" href="/#new">
              New
            </a>
            <a className="focus-ring rounded-lg px-2 py-1 hover:text-fg" href="/#popular">
              Popular
            </a>
          </nav>
          <a
            className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 text-sm font-extrabold text-fg transition hover:border-cyan/45 hover:bg-white/[0.06]"
            href="https://github.com/ry071702-prog/game-portal"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
            <ExternalLink size={15} />
          </a>
        </div>
      </div>
    </footer>
  )
}
