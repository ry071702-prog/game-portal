import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const MAX_RECENT = 8

interface RecentState {
  ids: string[]
  push: (id: string) => void
}

export const useRecentStore = create<RecentState>()(
  persist(
    (set) => ({
      ids: [],
      push: (id) =>
        set((state) => ({
          ids: [id, ...state.ids.filter((current) => current !== id)].slice(0, MAX_RECENT),
        })),
    }),
    { name: 'sea.recent', version: 1 },
  ),
)
