import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FavoritesState {
  ids: string[]
  toggle: (id: string) => void
  has: (id: string) => boolean
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set((state) => {
          if (state.ids.includes(id)) {
            return { ids: state.ids.filter((current) => current !== id) }
          }
          return { ids: [id, ...state.ids] }
        }),
      has: (id) => get().ids.includes(id),
    }),
    { name: 'sea.favorites', version: 1 },
  ),
)
