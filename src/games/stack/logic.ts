// スタックタワー: 左右に往復するブロックをタップで落とし、下の段からはみ出た分を削りながら積む
// 座標は盤面幅 W を 100 とした論理単位、描画側は % に変換するだけ

export const W = 100
export const BASE_WIDTH = 60
/** これ以下のズレは「ピタッ」と判定して下の段に揃える */
export const PERFECT_TOLERANCE = 2
/** パーフェクト連続でこの回数ごとに幅が少し戻る */
export const PERFECT_GROW_EVERY = 3
export const PERFECT_GROW = 4
/** 重なりがこれ未満だと画面上でほぼ見えないので外れ扱いにする */
export const MIN_WIDTH = 2

export interface Block {
  /** 左端の x (0..W) */
  x: number
  width: number
}

export interface StackState {
  /** 確定済みの段 (index 0 が土台) */
  tower: Block[]
  /** 移動中のブロック */
  current: Block
  /** 移動方向 (+1 右 / -1 左) */
  dir: 1 | -1
  /** 連続パーフェクト数 */
  combo: number
  over: boolean
}

/** 積んだ段数 (土台を除く) = スコア */
export function floors(s: StackState): number {
  return s.tower.length - 1
}

/** 段数に応じた移動速度 (単位/ms)、上に行くほど速く、上限あり */
export function speedFor(floor: number): number {
  return Math.min(0.045 + floor * 0.004, 0.13)
}

export function createGame(): StackState {
  const base: Block = { x: (W - BASE_WIDTH) / 2, width: BASE_WIDTH }
  return { tower: [base], current: spawn(base, 0), dir: 1, combo: 0, over: false }
}

/** 次のブロックを画面の左右どちらかの端から出す (段数の偶奇で交互) */
function spawn(top: Block, floor: number): Block {
  return { x: floor % 2 === 0 ? 0 : W - top.width, width: top.width }
}

/** 移動中ブロックを dt ms 進める、端で跳ね返る */
export function step(s: StackState, dtMs: number): StackState {
  if (s.over) return s
  const max = W - s.current.width
  let x = s.current.x + s.dir * speedFor(floors(s)) * dtMs
  let dir = s.dir
  // 長い dt でも往復を正しく折り返す
  while (x < 0 || x > max) {
    if (x > max) {
      x = 2 * max - x
      dir = -1
    } else {
      x = -x
      dir = 1
    }
  }
  return { ...s, current: { ...s.current, x }, dir }
}

export type DropResult = 'perfect' | 'cut' | 'miss'

/**
 * 下の段 prev に cur を落とした結果、重なった部分だけが残る
 * ズレが PERFECT_TOLERANCE 以下なら prev にぴったり揃える、重なりが MIN_WIDTH 未満なら外れ
 */
export function overlap(prev: Block, cur: Block): { block: Block | null; result: DropResult } {
  if (Math.abs(cur.x - prev.x) <= PERFECT_TOLERANCE) {
    return { block: { x: prev.x, width: prev.width }, result: 'perfect' }
  }
  const left = Math.max(prev.x, cur.x)
  const right = Math.min(prev.x + prev.width, cur.x + cur.width)
  if (right - left < MIN_WIDTH) return { block: null, result: 'miss' }
  return { block: { x: left, width: right - left }, result: 'cut' }
}

/** タップ: 現在のブロックを確定し、次のブロックを出す、外れたらゲームオーバー */
export function drop(s: StackState): { state: StackState; result: DropResult } {
  if (s.over) return { state: s, result: 'miss' }
  const top = s.tower[s.tower.length - 1]
  const { block, result } = overlap(top, s.current)
  if (!block) return { state: { ...s, over: true, combo: 0 }, result }

  const combo = result === 'perfect' ? s.combo + 1 : 0
  let placed = block
  if (combo > 0 && combo % PERFECT_GROW_EVERY === 0) {
    // ご褒美: 中心を保ったまま少し幅を戻す (土台幅が上限)
    const width = Math.min(block.width + PERFECT_GROW, BASE_WIDTH)
    const x = Math.min(Math.max(block.x - (width - block.width) / 2, 0), W - width)
    placed = { x, width }
  }
  const tower = [...s.tower, placed]
  const next: StackState = {
    tower,
    current: spawn(placed, tower.length - 1),
    dir: (tower.length - 1) % 2 === 0 ? 1 : -1,
    combo,
    over: false,
  }
  return { state: next, result }
}
