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
    badgeClass: 'bg-cyan/15 text-cyan ring-cyan/35',
    color: '#22d3ee',
  },
  arcade: {
    label: 'アクション',
    badgeClass: 'bg-yellow/15 text-yellow ring-yellow/40',
    color: '#ffd23f',
  },
  board: {
    label: '脳トレ',
    badgeClass: 'bg-pink/15 text-pink ring-pink/35',
    color: '#ff4d8d',
  },
}

/** 一覧で表示するジャンルの順序 */
export const GENRE_ORDER: GameGenre[] = ['puzzle', 'arcade', 'board']
