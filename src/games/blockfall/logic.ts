// ブロックフォール (落ち物パズル) の純粋ロジック。描画・入力は持たない。

export const COLS = 10
export const ROWS = 20

export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'
export const PIECE_TYPES: PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']

/** ミノごとの描画色 (7色で見分けやすく) */
export const PIECE_COLORS: Record<PieceType, string> = {
  I: '#22d3ee',
  O: '#fde047',
  T: '#a78bfa',
  S: '#4ade80',
  Z: '#f43f5e',
  J: '#60a5fa',
  L: '#fb923c',
}

/** 正方形バウンディングボックス内の形状 (回転0)。回転は行列を回して求める */
const SHAPES: Record<PieceType, number[][]> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
}

/** 盤面。null = 空、PieceType = 固定済みブロック (色分け用に種類を保持) */
export type Board = (PieceType | null)[][]

export interface Cell {
  x: number
  y: number
}

/** 操作中ミノ。x,y はバウンディングボックス左上の盤面座標 */
export interface Piece {
  type: PieceType
  /** 0-3 (時計回り) */
  rot: number
  x: number
  y: number
}

export interface BlockfallState {
  board: Board
  current: Piece
  /** NEXT 表示用の次ミノ */
  next: PieceType
  /** 7-bag の残り */
  bag: PieceType[]
  score: number
  /** 消去ライン累計 */
  lines: number
  /** 10ライン毎に +1 (初期1) */
  level: number
  alive: boolean
}

export function emptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array<PieceType | null>(COLS).fill(null))
}

/** 正方行列を時計回りに90度回転 */
function rotateMatrix(m: number[][]): number[][] {
  const n = m.length
  const out = m.map((row) => row.slice())
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) out[x][n - 1 - y] = m[y][x]
  }
  return out
}

/** 種類と回転数から形状行列を得る */
function matrixFor(type: PieceType, rot: number): number[][] {
  let m = SHAPES[type]
  const r = ((rot % 4) + 4) % 4
  for (let i = 0; i < r; i++) m = rotateMatrix(m)
  return m
}

/** ミノが占める盤面セル座標の一覧 */
export function getCells(piece: Piece): Cell[] {
  const m = matrixFor(piece.type, piece.rot)
  const cells: Cell[] = []
  for (let y = 0; y < m.length; y++) {
    for (let x = 0; x < m.length; x++) {
      if (m[y][x]) cells.push({ x: piece.x + x, y: piece.y + y })
    }
  }
  return cells
}

/** 盤面内に収まり既存ブロックと重ならないか (盤上端より上 y<0 は許容) */
export function canPlace(board: Board, piece: Piece): boolean {
  return getCells(piece).every(
    (c) => c.x >= 0 && c.x < COLS && c.y < ROWS && (c.y < 0 || board[c.y][c.x] === null),
  )
}

/** 平行移動を試す。置けなければ null */
export function tryMove(board: Board, piece: Piece, dx: number, dy: number): Piece | null {
  const moved = { ...piece, x: piece.x + dx, y: piece.y + dy }
  return canPlace(board, moved) ? moved : null
}

/** 時計回り回転を試す。壁際は左右±1,±2 の簡易壁蹴りで補正。だめなら null */
export function tryRotate(board: Board, piece: Piece): Piece | null {
  const rot = (piece.rot + 1) % 4
  for (const dx of [0, -1, 1, -2, 2]) {
    const rotated = { ...piece, rot, x: piece.x + dx }
    if (canPlace(board, rotated)) return rotated
  }
  return null
}

/** ミノを盤面に固定した新しい盤面を返す */
export function merge(board: Board, piece: Piece): Board {
  const next = board.map((row) => row.slice())
  for (const c of getCells(piece)) {
    if (c.y >= 0) next[c.y][c.x] = piece.type
  }
  return next
}

/** 揃った行を消して上から空行を詰める */
export function clearLines(board: Board): { board: Board; cleared: number } {
  const kept = board.filter((row) => row.some((cell) => cell === null))
  const cleared = ROWS - kept.length
  if (cleared === 0) return { board, cleared }
  const blank = Array.from({ length: cleared }, () => Array<PieceType | null>(COLS).fill(null))
  return { board: [...blank, ...kept], cleared }
}

/** 1/2/3/4ライン = 100/300/500/800 ×レベル */
const LINE_SCORES = [0, 100, 300, 500, 800]
export function scoreFor(cleared: number, level: number): number {
  return (LINE_SCORES[cleared] ?? 0) * level
}

/** レベルに応じた自然落下間隔 (ms)。下限 80ms */
export function dropInterval(level: number): number {
  return Math.max(80, 700 - 60 * level)
}

/** 7種1巡分を rng でシャッフルしたバッグを作る (7-bag 方式)。rng はテスト用に注入可 */
export function makeBag(rng: () => number = Math.random): PieceType[] {
  const bag = [...PIECE_TYPES]
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[bag[i], bag[j]] = [bag[j], bag[i]]
  }
  return bag
}

/** バッグから1つ引く。空なら新しいバッグを補充してから引く */
function drawFromBag(bag: PieceType[], rng: () => number): { type: PieceType; bag: PieceType[] } {
  const src = bag.length > 0 ? bag : makeBag(rng)
  return { type: src[0], bag: src.slice(1) }
}

/** 新しいミノを盤上端中央に出す */
export function spawn(type: PieceType): Piece {
  const size = SHAPES[type].length
  return { type, rot: 0, x: Math.floor((COLS - size) / 2), y: 0 }
}

export function initialState(rng: () => number = Math.random): BlockfallState {
  const first = drawFromBag([], rng)
  const second = drawFromBag(first.bag, rng)
  return {
    board: emptyBoard(),
    current: spawn(first.type),
    next: second.type,
    bag: second.bag,
    score: 0,
    lines: 0,
    level: 1,
    alive: true,
  }
}

export interface StepResult {
  state: BlockfallState
  /** このステップでミノが固定されたか */
  locked: boolean
  /** 消えたライン数 */
  cleared: number
}

/** ミノを固定 → ライン消去 → スコア/レベル更新 → 次ミノ出現。置けなければ alive=false */
function lockPiece(state: BlockfallState, rng: () => number): StepResult {
  const { board, cleared } = clearLines(merge(state.board, state.current))
  const lines = state.lines + cleared
  const drawn = drawFromBag(state.bag, rng)
  const current = spawn(state.next)
  return {
    state: {
      board,
      current,
      next: drawn.type,
      bag: drawn.bag,
      score: state.score + scoreFor(cleared, state.level),
      lines,
      level: Math.floor(lines / 10) + 1,
      alive: canPlace(board, current),
    },
    locked: true,
    cleared,
  }
}

/** 1段落下 (自然落下/ソフトドロップ共通)。着地していたら固定する */
export function tick(state: BlockfallState, rng: () => number = Math.random): StepResult {
  if (!state.alive) return { state, locked: false, cleared: 0 }
  const moved = tryMove(state.board, state.current, 0, 1)
  if (moved) return { state: { ...state, current: moved }, locked: false, cleared: 0 }
  return lockPiece(state, rng)
}

/** 接地位置の y (ゴースト表示・ハードドロップ用) */
export function dropY(board: Board, piece: Piece): number {
  let y = piece.y
  while (canPlace(board, { ...piece, y: y + 1 })) y++
  return y
}

/** 一番下まで落として即固定 */
export function hardDrop(state: BlockfallState, rng: () => number = Math.random): StepResult {
  if (!state.alive) return { state, locked: false, cleared: 0 }
  const current = { ...state.current, y: dropY(state.board, state.current) }
  return lockPiece({ ...state, current }, rng)
}
