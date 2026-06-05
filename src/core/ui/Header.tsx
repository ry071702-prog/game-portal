import { Link } from 'react-router-dom'
import { ChevronLeft, Gamepad2 } from 'lucide-react'
import { ProfileMenu } from './ProfileMenu'

interface HeaderProps {
  /** 戻るリンクを表示する (ゲーム画面用) */
  showBack?: boolean
}

export function Header({ showBack }: HeaderProps) {
  const navItems = [
    { label: 'Games', href: '/#games' },
    { label: 'Popular', href: '/#popular' },
    { label: 'New', href: '/#new' },
    { label: 'About', href: '/#about' },
  ]

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-[#080b14]/78 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:h-[4.5rem]">
        {showBack && (
          <Link
            to="/"
            className="focus-ring flex min-h-10 shrink-0 items-center gap-1 rounded-xl px-2.5 text-sm font-bold text-muted transition hover:bg-white/[0.06] hover:text-fg"
          >
            <ChevronLeft size={18} />
            一覧
          </Link>
        )}
        <Link
          to="/"
          className="focus-ring group flex min-w-0 shrink-0 items-center gap-3 rounded-xl text-fg"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-yellow to-cyan text-bg-base shadow-[0_0_34px_-18px_rgba(34,211,238,0.9)] transition group-hover:-translate-y-0.5 motion-reduce:group-hover:translate-y-0">
            <Gamepad2 size={18} />
          </span>
          <span className="min-w-0">
            <span className="font-display block truncate text-base uppercase text-fg sm:text-lg">
              GAME PORTAL
            </span>
            <span className="hidden text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted sm:block">
              Free Mini Games
            </span>
          </span>
        </Link>
        <nav
          className="ml-auto hidden min-w-0 items-center justify-end gap-1 md:flex"
          aria-label="ポータル内ナビゲーション"
        >
          {navItems.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="focus-ring flex min-h-10 shrink-0 items-center rounded-xl px-3 text-sm font-extrabold text-muted transition hover:bg-white/[0.06] hover:text-fg"
            >
              {label}
            </a>
          ))}
        </nav>
        <ProfileMenu />
      </div>
    </header>
  )
}
