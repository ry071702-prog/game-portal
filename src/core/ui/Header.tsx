import { Link } from 'react-router-dom'
import { BadgePlus, ChevronLeft, Flame, Gamepad2, Heart, Tags, Trophy } from 'lucide-react'
import { ProfileMenu } from './ProfileMenu'

interface HeaderProps {
  /** 戻るリンクを表示する (ゲーム画面用) */
  showBack?: boolean
}

export function Header({ showBack }: HeaderProps) {
  const navItems = [
    { label: '人気', to: '/#popular', Icon: Flame },
    { label: '新着', to: '/#new', Icon: BadgePlus },
    { label: 'ジャンル', to: '/#genres', Icon: Tags },
    { label: 'お気に入り', to: '/#favorites', Icon: Heart },
  ]

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg-panel/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        {showBack && (
          <Link
            to="/"
            className="focus-ring flex min-h-10 shrink-0 items-center gap-1 rounded-xl px-2.5 text-sm font-bold text-muted transition hover:bg-surface-2 hover:text-fg"
          >
            <ChevronLeft size={18} />
            一覧
          </Link>
        )}
        <Link to="/" className="focus-ring group flex shrink-0 items-center gap-2 rounded-xl text-fg">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow text-bg-base transition group-hover:-translate-y-0.5">
            <Gamepad2 size={18} />
          </span>
          <span className="font-display hidden text-lg text-fg sm:inline">
            Game Portal
          </span>
        </Link>
        <nav
          className="portal-scrollbar ml-auto flex min-w-0 flex-1 items-center justify-end gap-1 overflow-x-auto"
          aria-label="ポータル内ナビゲーション"
        >
          {navItems.map(({ label, to, Icon }) => (
            <Link
              key={to}
              to={to}
              className="focus-ring flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl px-3 text-sm font-bold text-muted transition hover:bg-surface-2 hover:text-fg"
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
          <Link
            to="/leaderboard"
            className="focus-ring flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl px-3 text-sm font-bold text-muted transition hover:bg-surface-2 hover:text-fg"
          >
            <Trophy size={15} />
            ランキング
          </Link>
        </nav>
        <ProfileMenu />
      </div>
    </header>
  )
}
