import { useState } from 'react'
import { sanitizeName, MAX_NAME_LEN } from '../lib/leaderboard'

interface NicknameDialogProps {
  open: boolean
  initialName?: string
  /** 決定時に呼ばれる (サニタイズ済みの名前) */
  onSubmit: (name: string) => void
  onClose: () => void
}

/** ランキング登録名を入力/変更するモーダル。 */
export function NicknameDialog({ open, initialName = '', onSubmit, onClose }: NicknameDialogProps) {
  const [value, setValue] = useState(initialName)
  if (!open) return null

  const preview = sanitizeName(value)
  const valid = preview.length > 0

  const submit = () => {
    if (valid) onSubmit(preview)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xs rounded-2xl border border-cyan-400/40 bg-[#12121c] p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="neon-text mb-1 text-lg font-bold text-cyan-300">ニックネーム</h2>
        <p className="mb-4 text-xs text-gray-400">
          ランキングに表示される名前です (最大{MAX_NAME_LEN}文字)。端末に保存され、次回から自動で使われます。
        </p>
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="名無しのプレイヤー"
          className="mb-4 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-white outline-none focus:border-cyan-400"
        />
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
          >
            あとで
          </button>
          <button
            onClick={submit}
            disabled={!valid}
            className="flex-1 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-black hover:bg-cyan-400 disabled:opacity-40"
          >
            決定
          </button>
        </div>
      </div>
    </div>
  )
}
