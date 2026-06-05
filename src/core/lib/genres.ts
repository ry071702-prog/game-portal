import type { GameGenre } from '../types'

interface GenreInfo {
  label: string
  /** Tailwind クラス: バッジの色 */
  badgeClass: string
  /** サムネイル面やアクセントに使うソリッドカラー */
  color: string
}

export const GENRES: Record<GameGenre, GenreInfo> = {
  puzzle: {
    label: 'パズル',
    badgeClass: 'bg-cyan/10 text-cyan ring-cyan/30',
    color: '#22d3ee',
  },
  arcade: {
    label: 'アクション',
    badgeClass: 'bg-yellow/10 text-yellow ring-yellow/30',
    color: '#8b5cf6',
  },
  board: {
    label: '脳トレ',
    badgeClass: 'bg-emerald-400/10 text-emerald-300 ring-emerald-300/25',
    color: '#10b981',
  },
}

/** 一覧で表示するジャンルの順序 */
export const GENRE_ORDER: GameGenre[] = ['puzzle', 'arcade', 'board']
