import type { GameManifest } from '../../core/types'

const manifest: GameManifest = {
  id: '2048',
  title: '2048',
  genre: 'puzzle',
  description: '同じ数字を合体させて 2048 を目指すパズル。',
  instructions: [
    'PC: 矢印キー / WASD でタイルを移動',
    'スマホ: 上下左右にスワイプ',
    '同じ数字がぶつかると合体し、合計がスコアになります',
  ],
  thumbnail: '🔢',
  accentColor: 'rgba(170, 59, 255, 0.15)',
  difficulty: 'normal',
  minutes: 5,
  featured: true,
  component: () => import('./Game2048'),
}

export default manifest
