import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SoundState {
  muted: boolean
  toggleMuted: () => void
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set) => ({
      muted: false,
      toggleMuted: () => set((s) => ({ muted: !s.muted })),
    }),
    { name: 'game-portal-sound', version: 1 },
  ),
)
