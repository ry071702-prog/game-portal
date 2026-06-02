import { Link } from 'react-router-dom'
import { Gamepad2, ChevronLeft, Trophy, CalendarDays } from 'lucide-react'
import { ProfileMenu } from './ProfileMenu'

interface HeaderProps {
  /** 戻るリンクを表示する (ゲーム画面用) */
  showBack?: boolean
}

export function Header({ showBack }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#ffe000]/20 bg-[var(--bg-panel)] backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
        {showBack && (
          <Link
            to="/"
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-muted hover:bg-surface-2"
          >
            <ChevronLeft size={18} />
            一覧
          </Link>
        )}
        <Link to="/" className="flex items-center gap-2 text-fg">
          <span className="flex h-7 w-7 items-center justify-center rounded bg-[#ffe000] text-black">
            <Gamepad2 size={18} />
          </span>
          <span className="font-display text-lg tracking-wide text-fg">GAME PORTAL</span>
        </Link>
        <Link
          to="/daily"
          className="ml-auto flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-muted hover:bg-surface-2 hover:text-accent"
        >
          <CalendarDays size={16} className="text-accent" />
          <span className="hidden sm:inline">今日の</span>
        </Link>
        <Link
          to="/leaderboard"
          className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-muted hover:bg-surface-2 hover:text-gold"
        >
          <Trophy size={16} className="text-gold" />
          <span className="hidden sm:inline">ランキング</span>
        </Link>
        <ProfileMenu />
      </div>
    </header>
  )
}
