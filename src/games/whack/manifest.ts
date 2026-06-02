import type { GameManifest } from '../../core/types'

const manifest: GameManifest = {
  id: 'whack',
  title: 'もぐら叩き',
  genre: 'arcade',
  description: '出てくるモグラを制限時間内にできるだけ叩く反射神経ゲーム。',
  instructions: ['穴から出たモグラ🐹をタップ/クリック', '制限時間は30秒', '叩いた数がスコア'],
  thumbnail: '🐹',
  accentColor: 'rgba(132, 204, 22, 0.15)',
  component: () => import('./WhackGame'),
}

export default manifest
