import type { GameManifest } from '../../core/types'

const manifest: GameManifest = {
  id: 'hitblow',
  title: 'ヒット&ブロー',
  genre: 'puzzle',
  category: 'Puzzle',
  description: 'Hit と Blow のヒントを頼りに、重複なし4桁の数字を10回以内に推理するマスターマインド系パズル。',
  instructions: [
    'テンキー (またはキーボードの数字キー) で重複なしの4桁を入力して確定',
    'Hit = 数字も位置も一致 / Blow = 数字は合っているが位置が違う',
    '10回以内に 4Hit で勝ち。少ない回数ほど高スコア',
  ],
  thumbnail: '🔢',
  accentColor: 'rgba(251, 113, 133, 0.15)',
  difficulty: 'normal',
  minutes: 5,
  isNew: true,
  popularity: 72,
  component: () => import('./HitblowGame'),
}

export default manifest
