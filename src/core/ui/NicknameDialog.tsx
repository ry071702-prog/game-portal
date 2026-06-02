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
        className="w-full max-w-xs rounded-2xl border border-[#ffe000]/40 bg-[var(--bg-overlay)] p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="neon-text mb-1 text-lg font-bold text-accent">ニックネーム</h2>
        <p className="mb-4 text-xs text-muted">
          ランキングに表示される名前です (最大{MAX_NAME_LEN}文字)。端末に保存され、次回から自動で使われます。
        </p>
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="名無しのプレイヤー"
          className="mb-4 w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-fg outline-none focus:border-[#ffe000]"
        />
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-surface-2 px-4 py-2 text-sm text-fg hover:opacity-80"
          >
            あとで
          </button>
          <button
            onClick={submit}
            disabled={!valid}
            className="flex-1 rounded-lg bg-[#ffe000] px-4 py-2 text-sm font-extrabold text-black transition hover:brightness-110 disabled:opacity-40"
          >
            決定
          </button>
        </div>
      </div>
    </div>
  )
}
