import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface IdentityState {
  /** 端末ごとの匿名ID。初回生成して永続化 */
  clientId: string
  /** ランキング表示名。未設定なら '' */
  name: string
  setName: (name: string) => void
}

function newClientId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `c-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`
}

export const useIdentityStore = create<IdentityState>()(
  persist(
    (set) => ({
      clientId: newClientId(),
      name: '',
      setName: (name) => set({ name }),
    }),
    {
      name: 'game-portal-identity',
      version: 1,
      // clientId が無い古い状態にも補完
      onRehydrateStorage: () => (state) => {
        if (state && !state.clientId) state.clientId = newClientId()
      },
    },
  ),
)
