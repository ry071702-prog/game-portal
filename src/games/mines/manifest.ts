import type { GameManifest } from '../../core/types'

const manifest: GameManifest = {
  id: 'mines',
  title: 'マインスイーパー',
  genre: 'puzzle',
  category: 'Puzzle',
  description: '数字をヒントに地雷を避けて全マス開放する定番の論理パズル。',
  instructions: [
    'マスをタップ/クリックで開く。数字は周囲8マスの地雷数',
    'PC: 右クリックで旗を立てる / スマホ: 旗モードに切り替えてタップ',
    '地雷以外をすべて開けばクリア (+30ボーナス)。地雷を踏むとゲームオーバー',
  ],
  thumbnail: '💣',
  accentColor: 'rgba(244, 63, 94, 0.15)',
  difficulty: 'normal',
  minutes: 5,
  isNew: true,
  popularity: 80,
  component: () => import('./MinesGame'),
}

export default manifest
