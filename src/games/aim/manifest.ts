import type { GameManifest } from '../../core/types'

const manifest: GameManifest = {
  id: 'aim',
  title: 'ターゲットラッシュ',
  genre: 'arcade',
  category: 'Reflex',
  description: '縮んで消える的を素早く撃ち抜くエイムトレーナー。大きいうちに当てるほど高得点。',
  instructions: [
    'PC: 現れた的をクリック / スマホ: タップ',
    '的は約2秒で縮んで消える。大きいうちに当てるほど高得点',
    '的以外を押すと -20 点。進むほど的が小さく・速くなる。制限時間は30秒',
  ],
  thumbnail: '🎯',
  accentColor: 'rgba(244, 114, 182, 0.15)',
  difficulty: 'easy',
  minutes: 1,
  isNew: true,
  popularity: 85,
  component: () => import('./AimGame'),
}

export default manifest
