// 選択できるユーザーアイコン (絵文字)。サーバー側 functions/_shared/scores.ts と同期。
export const AVATARS = [
  '🎮',
  '👾',
  '🤖',
  '👽',
  '🐱',
  '🐶',
  '🦊',
  '🐼',
  '🐸',
  '🦄',
  '🐲',
  '🦖',
  '⭐',
  '🔥',
  '🌈',
  '💀',
  '🎧',
  '🍩',
] as const

export type Avatar = (typeof AVATARS)[number]

export const DEFAULT_AVATAR: Avatar = '🎮'

/** clientId から決定論的に既定アイコンを選ぶ (ユーザーごとにばらつき)。 */
export function pickAvatar(seed: string): Avatar {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return AVATARS[h % AVATARS.length]
}

/** 未知の値は既定にフォールバック (緩い検証)。 */
export function normalizeAvatar(value: unknown): Avatar {
  return typeof value === 'string' && (AVATARS as readonly string[]).includes(value)
    ? (value as Avatar)
    : DEFAULT_AVATAR
}
