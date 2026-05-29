import type { GameManifest } from './types'
import { validateRegistry } from './types'

// ── ゲーム追加はここに import を1行足すだけ ──
import game2048 from '../games/2048/manifest'
import snake from '../games/snake/manifest'
import memory from '../games/memory/manifest'

const raw: GameManifest[] = [game2048, snake, memory]

/** 検証済みゲーム一覧。id 重複や形式不正は起動時に throw される。 */
export const games = validateRegistry(raw)

/** id からの高速参照 */
export const gameById = new Map(games.map((g) => [g.id, g]))
