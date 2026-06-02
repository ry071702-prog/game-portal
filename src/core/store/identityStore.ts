import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { pickAvatar, type Avatar } from '../lib/avatars'

interface IdentityState {
  /** 端末ごとの匿名ID。初回生成して永続化 */
  clientId: string
  /** ランキング表示名。未設定なら '' */
  name: string
  /** ユーザーアイコン (絵文字) */
  avatar: Avatar
  setName: (name: string) => void
  setAvatar: (avatar: Avatar) => void
}

function newClientId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `c-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`
}

export const useIdentityStore = create<IdentityState>()(
  persist(
    (set) => {
      const clientId = newClientId()
      return {
        clientId,
        name: '',
        avatar: pickAvatar(clientId),
        setName: (name) => set({ name }),
        setAvatar: (avatar) => set({ avatar }),
      }
    },
    {
      name: 'game-portal-identity',
      version: 2,
      // 古い状態 (clientId 無し / avatar 無し) を補完
      onRehydrateStorage: () => (state) => {
        if (!state) return
        if (!state.clientId) state.clientId = newClientId()
        if (!state.avatar) state.avatar = pickAvatar(state.clientId)
      },
    },
  ),
)
