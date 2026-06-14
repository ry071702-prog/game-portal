import type { GameManifest } from '../../core/types'

const manifest: GameManifest = {
  id: 'connect4',
  title: '四目並べ',
  genre: 'board',
  category: 'Strategy',
  description: 'AI と対戦する四目並べ。列に駒を落として先に4つ並べよう。',
  instructions: [
    '列をタップ/クリックすると、一番下の空きマスに赤い駒が落ちます',
    '縦・横・斜めのいずれかに先に4つ並べたら勝ち',
    'あなたが先手 (赤)、AI が後手 (黄)。少ない手数で勝つほど高スコア',
  ],
  thumbnail: '🔴',
  accentColor: 'rgba(248, 113, 113, 0.15)',
  difficulty: 'normal',
  minutes: 4,
  isNew: true,
  popularity: 78,
  component: () => import('./Connect4Game'),
}

export default manifest
