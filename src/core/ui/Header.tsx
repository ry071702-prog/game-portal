import { Link } from 'react-router-dom'
import { Gamepad2, ChevronLeft } from 'lucide-react'

interface HeaderProps {
  /** 戻るリンクを表示する (ゲーム画面用) */
  showBack?: boolean
}

export function Header({ showBack }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-[#0f1117]/80 backdrop-blur">
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
        <Link to="/" className="flex items-center gap-2 font-semibold text-white">
          <Gamepad2 size={22} className="text-violet-400" />
          Game Portal
        </Link>
      </div>
    </header>
  )
}
