import type { GameGenre } from '../types'

interface GenreInfo {
  label: string
  /** Tailwind クラス: バッジの色 */
  badgeClass: string
  /** ゲーム画面のアンビエント(発光オーブ)の色。ジャンルごとに雰囲気を変える。 */
  orb: string
}

export const GENRES: Record<GameGenre, GenreInfo> = {
  puzzle: {
    label: 'パズル',
    badgeClass: 'bg-violet-500/15 text-violet-700 ring-violet-500/40 dark:text-violet-300',
    orb: '#8b5cf6',
  },
  arcade: {
    label: 'アーケード',
    badgeClass: 'bg-[#ffe000]/20 text-amber-700 ring-[#ffe000]/50 dark:text-[#ffe000]',
    orb: '#ffe000',
  },
  board: {
    label: 'ボード',
    badgeClass: 'bg-emerald-500/15 text-emerald-700 ring-emerald-500/40 dark:text-emerald-300',
    orb: '#10b981',
  },
}

/** 一覧で表示するジャンルの順序 */
export const GENRE_ORDER: GameGenre[] = ['puzzle', 'arcade', 'board']
