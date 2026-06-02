import type { GameManifest } from './types'
import { validateRegistry } from './types'

// ── ゲーム追加はここに import を1行足すだけ ──
import game2048 from '../games/2048/manifest'
import snake from '../games/snake/manifest'
import memory from '../games/memory/manifest'
import lightsout from '../games/lightsout/manifest'
import breakout from '../games/breakout/manifest'
import simon from '../games/simon/manifest'
import slide15 from '../games/slide15/manifest'
import whack from '../games/whack/manifest'
import flap from '../games/flap/manifest'
import numtap from '../games/numtap/manifest'

const raw: GameManifest[] = [
  game2048,
  snake,
  memory,
  lightsout,
  breakout,
  simon,
  slide15,
  whack,
  flap,
  numtap,
]

/** 検証済みゲーム一覧。id 重複や形式不正は起動時に throw される。 */
export const games = validateRegistry(raw)

/** id からの高速参照 */
export const gameById = new Map(games.map((g) => [g.id, g]))
