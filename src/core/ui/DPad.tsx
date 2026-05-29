import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Direction } from '../lib/direction'

/** モバイル向け方向パッド。タッチで Direction を発火する。 */
export function DPad({ onDirection }: { onDirection: (dir: Direction) => void }) {
  const btn =
    'flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 text-white active:bg-white/25'

  const press = (dir: Direction) => (e: React.PointerEvent) => {
    e.preventDefault()
    onDirection(dir)
  }

  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-2 select-none">
      <span />
      <button className={btn} onPointerDown={press('up')} aria-label="上">
        <ChevronUp />
      </button>
      <span />
      <button className={btn} onPointerDown={press('left')} aria-label="左">
        <ChevronLeft />
      </button>
      <span />
      <button className={btn} onPointerDown={press('right')} aria-label="右">
        <ChevronRight />
      </button>
      <span />
      <button className={btn} onPointerDown={press('down')} aria-label="下">
        <ChevronDown />
      </button>
      <span />
    </div>
  )
}
