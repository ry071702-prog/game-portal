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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="glass-strong w-full max-w-xs rounded-[1.35rem] border-accent/40 p-5"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="nickname-dialog-title"
      >
        <h2 id="nickname-dialog-title" className="font-display mb-1 text-2xl text-fg">
          ニックネーム
        </h2>
        <p className="mb-4 text-xs text-muted">
          ランキングに表示される名前です (最大{MAX_NAME_LEN}文字)。端末に保存され、次回から自動で使われます。
        </p>
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="名無しのプレイヤー"
          className="input-premium mb-4 w-full rounded-xl px-3 py-2.5 outline-none"
        />
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="btn-soft flex-1 text-sm"
          >
            あとで
          </button>
          <button
            onClick={submit}
            disabled={!valid}
            className="btn-primary flex-1 text-sm"
          >
            決定
          </button>
        </div>
      </div>
    </div>
  )
}
