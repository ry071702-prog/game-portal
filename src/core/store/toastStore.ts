import { create } from 'zustand'

export interface Toast {
  id: number
  message: string
  kind: 'info' | 'error' | 'success'
}

interface ToastState {
  toasts: Toast[]
  push: (message: string, kind?: Toast['kind']) => void
  remove: (id: number) => void
}

let seq = 0

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (message, kind = 'info') => {
    const id = ++seq
    set((s) => ({ toasts: [...s.toasts, { id, message, kind }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3000)
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

/** ストア外からも呼べるショートカット */
export const toast = {
  info: (m: string) => useToastStore.getState().push(m, 'info'),
  error: (m: string) => useToastStore.getState().push(m, 'error'),
  success: (m: string) => useToastStore.getState().push(m, 'success'),
}
