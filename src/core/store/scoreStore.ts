import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ScoreState {
  /** gameId -> ベストスコア */
  best: Record<string, number>
  /** score が既存ベストを上回るときだけ更新する */
  setBest: (gameId: string, score: number) => void
  getBest: (gameId: string) => number
}

export const useScoreStore = create<ScoreState>()(
  persist(
    (set, get) => ({
      best: {},
      setBest: (gameId, score) =>
        set((state) => {
          const current = state.best[gameId] ?? 0
          if (score <= current) return state
          return { best: { ...state.best, [gameId]: score } }
        }),
      getBest: (gameId) => get().best[gameId] ?? 0,
    }),
    { name: 'game-portal-scores', version: 1 },
  ),
)
