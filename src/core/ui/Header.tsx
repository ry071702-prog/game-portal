import { Link } from 'react-router-dom'
import { Gamepad2, ChevronLeft, Trophy } from 'lucide-react'
import { ProfileMenu } from './ProfileMenu'

interface HeaderProps {
  /** 戻るリンクを表示する (ゲーム画面用) */
  showBack?: boolean
}

export function Header({ showBack }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-cyan-400/20 bg-[var(--bg-panel)] backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
        {showBack && (
          <Link
            to="/"
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-gray-300 hover:bg-white/10"
          >
            <ChevronLeft size={18} />
            一覧
          </Link>
        )}
        <Link to="/" className="flex items-center gap-2 text-white">
          <Gamepad2 size={22} className="neon-text text-cyan-400" />
          <span className="font-pixel flicker text-sm text-cyan-300">GAME PORTAL</span>
        </Link>
        <Link
          to="/leaderboard"
          className="ml-auto flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-gray-300 hover:bg-white/10 hover:text-yellow-300"
        >
          <Trophy size={16} className="text-yellow-300" />
          <span className="hidden sm:inline">ランキング</span>
        </Link>
        <ProfileMenu />
      </div>
    </header>
  )
}
