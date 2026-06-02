import { useState } from 'react'
import { Pencil, Monitor, Sun, Moon, Check, Volume2, VolumeX } from 'lucide-react'
import { useIdentityStore } from '../store/identityStore'
import { useSoundStore } from '../store/soundStore'
import { AVATARS } from '../lib/avatars'
import { useTheme, type Theme } from '../lib/theme'
import { NicknameDialog } from './NicknameDialog'
import { cn } from '../lib/cn'

const THEME_OPTS: { value: Theme; label: string; Icon: typeof Monitor }[] = [
  { value: 'system', label: 'システム', Icon: Monitor },
  { value: 'light', label: 'ライト', Icon: Sun },
  { value: 'dark', label: 'ダーク', Icon: Moon },
]

/** 右上のユーザーアイコン + 名前。クリックで設定 (名前・アイコン・テーマ) を開く。 */
export function ProfileMenu() {
  const { name, avatar, setName, setAvatar } = useIdentityStore()
  const muted = useSoundStore((s) => s.muted)
  const toggleMuted = useSoundStore((s) => s.toggleMuted)
  const [theme, setTheme] = useTheme()
  const [open, setOpen] = useState(false)
  const [nickOpen, setNickOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-line bg-surface py-1 pr-3 pl-1 hover:border-cyan-400/40"
        aria-label="ユーザー設定"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/20 text-base">
          {avatar}
        </span>
        <span className="max-w-24 truncate text-sm text-fg">{name || 'ゲスト'}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-cyan-400/30 bg-[var(--bg-overlay)] p-4 shadow-xl">
            {/* 現在のプロフィール */}
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-500/20 text-2xl">
                {avatar}
              </span>
              <div className="min-w-0">
                <p className="truncate font-bold text-fg">{name || 'ゲスト'}</p>
                <button
                  onClick={() => setNickOpen(true)}
                  className="flex items-center gap-1 text-xs text-accent hover:underline"
                >
                  <Pencil size={11} />
                  名前を変更
                </button>
              </div>
            </div>

            {/* アイコン選択 */}
            <p className="mb-2 text-xs font-bold tracking-wide text-muted uppercase">アイコン</p>
            <div className="mb-4 grid grid-cols-6 gap-1">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAvatar(a)}
                  className={cn(
                    'flex aspect-square items-center justify-center rounded-lg text-lg hover:bg-surface-2',
                    a === avatar && 'bg-cyan-500/25 ring-1 ring-cyan-400/60',
                  )}
                  aria-label={`アイコン ${a}`}
                >
                  {a}
                </button>
              ))}
            </div>

            {/* テーマ */}
            <p className="mb-2 text-xs font-bold tracking-wide text-muted uppercase">テーマ</p>
            <div className="flex gap-1 rounded-lg bg-surface-2 p-1">
              {THEME_OPTS.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs',
                    theme === value ? 'bg-cyan-500 font-bold text-black' : 'text-muted',
                  )}
                >
                  {theme === value ? <Check size={13} /> : <Icon size={13} />}
                  {label}
                </button>
              ))}
            </div>

            {/* サウンド */}
            <p className="mt-4 mb-2 text-xs font-bold tracking-wide text-muted uppercase">サウンド</p>
            <button
              onClick={toggleMuted}
              className="flex w-full items-center justify-between rounded-lg bg-surface-2 px-3 py-2 text-sm text-fg"
            >
              <span className="flex items-center gap-2">
                {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                効果音
              </span>
              <span className={cn('text-xs font-bold', muted ? 'text-faint' : 'text-accent')}>
                {muted ? 'OFF' : 'ON'}
              </span>
            </button>
          </div>
        </>
      )}

      <NicknameDialog
        open={nickOpen}
        initialName={name}
        onSubmit={(n) => {
          setName(n)
          setNickOpen(false)
        }}
        onClose={() => setNickOpen(false)}
      />
    </div>
  )
}
