import { Brain, Crosshair, Flag, Swords, Users } from 'lucide-react'

const UPCOMING = [
  { title: 'Racing', Icon: Flag },
  { title: 'Shooting', Icon: Crosshair },
  { title: 'Brain Training', Icon: Brain },
  { title: 'Multiplayer', Icon: Users },
  { title: 'Ranking Battle', Icon: Swords },
]

export function ComingSoon() {
  return (
    <section id="about" className="scroll-mt-24 py-10">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black tracking-[0.2em] text-cyan uppercase">Coming Soon</p>
          <h2 className="font-display mt-2 text-3xl text-fg sm:text-4xl">
            More games coming soon
          </h2>
        </div>
        <p className="max-w-md text-sm font-bold leading-6 text-muted">
          新作ゲームを順次追加予定。公開前のジャンルはプレースホルダとして表示しています。
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {UPCOMING.map(({ title, Icon }) => (
          <article
            key={title}
            className="relative overflow-hidden rounded-3xl border border-dashed border-line bg-white/[0.025] p-5 text-muted"
            aria-disabled="true"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-surface/70 text-faint">
              <Icon size={20} />
            </div>
            <h3 className="mt-5 text-lg font-black text-fg">{title}</h3>
            <p className="mt-2 inline-flex rounded-full border border-line bg-surface/60 px-3 py-1 text-xs font-black uppercase tracking-wide text-faint">
              Coming Soon
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
