import type { GameManifest } from '../../core/types'

const manifest: GameManifest = {
  id: 'snake',
  title: 'スネーク',
  genre: 'arcade',
  category: 'Action',
  description: 'エサを食べて伸びる定番アーケード。壁と自分に注意。',
  instructions: [
    'PC: 矢印キー / WASD で方向転換',
    'スマホ: スワイプ、または画面下の方向ボタン',
    'エサ1個でスコア+1。食べるほど加速します',
  ],
  thumbnail: '🐍',
  accentColor: 'rgba(34, 211, 238, 0.15)',
  difficulty: 'normal',
  minutes: 4,
  featured: true,
  popularity: 94,
  component: () => import('./SnakeGame'),
}

export default manifest
