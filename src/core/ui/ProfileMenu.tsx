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
        className="focus-ring flex min-h-10 items-center gap-2 rounded-full border border-line bg-[var(--control-bg)] py-1 pr-3 pl-1 shadow-[var(--glass-highlight)] transition hover:border-accent/45 hover:bg-[var(--control-hover)]"
        aria-label="ユーザー設定"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-bg text-base ring-1 ring-accent/30">
          {avatar}
        </span>
        <span className="hidden max-w-24 truncate text-sm font-bold text-fg sm:inline">
          {name || 'ゲスト'}
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div className="glass-strong absolute right-0 z-50 mt-2 w-72 rounded-[1.35rem] border-accent/30 p-4">
            {/* 現在のプロフィール */}
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-bg text-2xl ring-1 ring-accent/35">
                {avatar}
              </span>
              <div className="min-w-0">
                <p className="truncate font-bold text-fg">{name || 'ゲスト'}</p>
                <button
                  onClick={() => setNickOpen(true)}
                  className="focus-ring mt-1 flex items-center gap-1 rounded-md text-xs font-bold text-accent hover:underline"
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
                    'focus-ring flex aspect-square items-center justify-center rounded-xl text-lg transition hover:bg-surface-2',
                    a === avatar && 'bg-accent-bg ring-1 ring-accent/60',
                  )}
                  aria-label={`アイコン ${a}`}
                >
                  {a}
                </button>
              ))}
            </div>

            {/* テーマ */}
            <p className="mb-2 text-xs font-bold tracking-wide text-muted uppercase">テーマ</p>
            <div className="segmented">
              {THEME_OPTS.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-1 px-2 py-1.5 text-xs font-bold text-muted',
                    theme === value && 'is-active',
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
              className="focus-ring flex w-full items-center justify-between rounded-xl border border-line bg-[var(--control-bg)] px-3 py-2 text-sm font-bold text-fg transition hover:border-accent/45 hover:bg-[var(--control-hover)]"
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
