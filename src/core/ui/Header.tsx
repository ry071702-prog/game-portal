import { Link, NavLink } from 'react-router-dom'
import { Gamepad2, ChevronLeft, Trophy, CalendarDays } from 'lucide-react'
import { cn } from '../lib/cn'
import { ProfileMenu } from './ProfileMenu'

interface HeaderProps {
  /** 戻るリンクを表示する (ゲーム画面用) */
  showBack?: boolean
}

export function Header({ showBack }: HeaderProps) {
  const navClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'focus-ring flex min-h-9 items-center gap-1.5 rounded-xl px-2.5 text-sm font-bold text-muted transition hover:bg-surface-2 hover:text-fg',
      isActive && 'bg-accent-bg text-fg ring-1 ring-accent/35',
    )

  return (
    <header className="glass sticky top-0 z-30 border-x-0 border-t-0 border-b border-accent/25">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-2 px-4 sm:gap-3">
        {showBack && (
          <Link
            to="/"
            className="focus-ring flex min-h-9 items-center gap-1 rounded-xl px-2.5 text-sm font-bold text-muted transition hover:bg-surface-2 hover:text-fg"
          >
            <ChevronLeft size={18} />
            一覧
          </Link>
        )}
        <Link to="/" className="focus-ring group flex items-center gap-2 rounded-xl text-fg">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-accent/50 bg-[linear-gradient(135deg,#f7e3a4,#c99b48)] text-[#151018] shadow-[0_0_22px_-12px_rgba(232,200,122,0.9),inset_0_1px_0_rgba(255,255,255,0.58)] transition group-hover:translate-y-[-1px]">
            <Gamepad2 size={18} />
          </span>
          <span className="font-display hidden text-lg tracking-wide text-fg sm:inline">
            GAME PORTAL
          </span>
        </Link>
        <NavLink
          to="/daily"
          className={(state) => cn(navClass(state), 'ml-auto')}
        >
          <CalendarDays size={16} className="text-accent" />
          <span className="hidden sm:inline">今日の</span>
        </NavLink>
        <NavLink
          to="/leaderboard"
          className={navClass}
        >
          <Trophy size={16} className="text-gold" />
          <span className="hidden sm:inline">ランキング</span>
        </NavLink>
        <ProfileMenu />
      </div>
    </header>
  )
}
