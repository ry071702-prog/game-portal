import { useToastStore } from '../store/toastStore'
import { cn } from '../lib/cn'

const KIND_CLASS = {
  info: 'border-cyan/60 text-fg',
  success: 'border-emerald-500/60 text-emerald-300',
  error: 'border-pink/60 text-pink',
}

/** 画面下部のトースト表示。Layout に1つ配置する。 */
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto rounded-xl border bg-bg-panel px-4 py-3 text-sm font-bold shadow-[var(--lift-shadow)]',
            KIND_CLASS[t.kind],
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
