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
    badgeClass: 'bg-cyan-500/10 text-cyan-700 ring-cyan-500/35 dark:text-cyan-200',
    orb: '#5ad1e6',
  },
  arcade: {
    label: 'アーケード',
    badgeClass:
      'bg-[rgba(232,200,122,0.16)] text-[#8d6a2a] ring-[rgba(232,200,122,0.45)] dark:text-[#e8c87a]',
    orb: '#e8c87a',
  },
  board: {
    label: 'ボード',
    badgeClass: 'bg-indigo-500/15 text-indigo-700 ring-indigo-400/40 dark:text-indigo-200',
    orb: '#7a8cff',
  },
}

/** 一覧で表示するジャンルの順序 */
export const GENRE_ORDER: GameGenre[] = ['puzzle', 'arcade', 'board']
