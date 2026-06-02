import { useToastStore } from '../store/toastStore'
import { cn } from '../lib/cn'

const KIND_CLASS = {
  info: 'border-[#ffe000]/70 text-fg',
  success: 'border-green-500/60 text-green-700 dark:text-green-300',
  error: 'border-rose-500/60 text-rose-700 dark:text-rose-300',
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
            'pointer-events-auto rounded-lg border bg-[var(--bg-overlay)] px-4 py-2 text-sm shadow-lg',
            KIND_CLASS[t.kind],
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
