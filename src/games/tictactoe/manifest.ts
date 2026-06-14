import type { GameManifest } from '../../core/types'

const manifest: GameManifest = {
  id: 'tictactoe',
  title: '○×ゲーム',
  genre: 'board',
  category: 'Strategy',
  description: 'AI と対戦する三目並べ。勝つほど AI が強くなる連勝チャレンジ。',
  instructions: [
    'マスをタップ/クリックして ○ を置く (あなたが先手、AI が ×)',
    '縦・横・斜めに3つ並べると勝ち。勝つと +100、引き分けは +20 で次ラウンドへ',
    'ラウンドが進むほど AI が強くなる。負けた時点で連勝チャレンジ終了',
  ],
  thumbnail: '⭕',
  accentColor: 'rgba(34, 211, 238, 0.15)',
  difficulty: 'easy',
  minutes: 3,
  isNew: true,
  popularity: 75,
  component: () => import('./TictactoeGame'),
}

export default manifest
