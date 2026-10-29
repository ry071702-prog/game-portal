import type { GameManifest } from '../../core/types'

const manifest: GameManifest = {
  id: 'colorword',
  title: 'カラーワード',
  genre: 'arcade',
  category: 'Reflex',
  description: '「あか」と書かれた青い文字…色と意味がちぐはぐな文字に、お題どおり素早く答える脳トレゲーム。',
  instructions: [
    'お題が「いろ」なら文字の色、「いみ」なら書いてある言葉のボタンをタップ/クリック',
    '制限時間は30秒。まちがえると残り時間 -2 秒',
    '連続正解ほど加点アップ (最大 +20)。途中から「いみ」のお題も混ざる',
  ],
  thumbnail: '🎨',
  accentColor: 'rgba(250, 204, 21, 0.15)',
  difficulty: 'normal',
  minutes: 1,
  isNew: true,
  popularity: 77,
  component: () => import('./ColorWordGame'),
}

export default manifest
