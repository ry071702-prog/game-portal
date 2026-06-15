/**
 * ゲーム内スプライト & アバターを Gemini で生成する（透過 PNG・cyber arcade 画風）。
 *
 *   GEMINI_API_KEY=... npm run gen:sprites              # 未生成のみ
 *   GEMINI_API_KEY=... npm run gen:sprites -- --force   # 全部作り直し
 *   GEMINI_API_KEY=... npm run gen:sprites -- mole apple # 指定 slug だけ
 *
 * 鍵は .dev.vars からも自動読込（gen-icons と同じ運用）。出力は public/sprites/<slug>.png。
 * 生成後 `npm run sprites:resize`（sips）で 256px に縮小して軽量化する。
 */
import { writeFile, mkdir } from 'node:fs/promises'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'public', 'sprites')

function loadLocalEnv(): void {
  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) return
  const envPath = join(__dirname, '..', '.dev.vars')
  if (!existsSync(envPath)) return
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/)
    if (!m) continue
    let val = m[2]
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!(m[1] in process.env)) process.env[m[1]] = val
  }
}

// 全スプライト共通の画風。Gemini は「透過」と言うと市松模様を描くため、
// アイコンと同じ #080B14 ソリッド背景で生成し、ダークUIに馴染ませる。
const STYLE =
  ' Single subject, centered, filling most of the frame. Clean modern game sticker:' +
  ' bold flat shapes with a subtle neon glow, cohesive cyber-arcade vibe with violet (#8B5CF6)' +
  ' and cyan (#22D3EE) accents, premium and friendly. Render on a SOLID FLAT near-black (#080B14)' +
  ' background filling the whole frame (absolutely no checkerboard, no transparency pattern, no scene),' +
  ' with a small even margin, square 1:1 composition. No text, no letters, no numbers, no extra props.' +
  ' Crisp edges, consistent lighting and palette across the whole set.'

interface Sprite {
  slug: string
  subject: string
}

const SPRITES: Sprite[] = [
  // whack
  { slug: 'mole', subject: 'a cute cartoon mole popping up, cheeky friendly face, small paws' },
  // memory fruits（順序は EMOJIS と対応）
  { slug: 'apple', subject: 'a glossy red apple with a small green leaf' },
  { slug: 'banana', subject: 'a ripe yellow banana' },
  { slug: 'grapes', subject: 'a bunch of purple grapes' },
  { slug: 'peach', subject: 'a soft pink-orange peach with a leaf' },
  { slug: 'strawberry', subject: 'a red strawberry with seeds and a green top' },
  { slug: 'cherries', subject: 'a pair of red cherries joined by stems' },
  { slug: 'kiwi', subject: 'a kiwi fruit cut in half showing bright green flesh and seeds' },
  { slug: 'pineapple', subject: 'a whole pineapple with green crown' },
  // mines
  { slug: 'bomb', subject: 'a classic round black cartoon bomb with a lit fuse and a bright spark' },
  { slug: 'flag', subject: 'a small triangular red flag on a thin pole' },
  // avatars（🎮👾🤖👽🐱🐶🦊🐼🐸🦄🐲🦖⭐🔥🌈💀🎧🍩）
  { slug: 'av-gamepad', subject: 'a sleek game controller / gamepad' },
  { slug: 'av-invader', subject: 'a retro pixel-style space-invader alien monster' },
  { slug: 'av-robot', subject: 'a friendly boxy robot head' },
  { slug: 'av-alien', subject: 'a grey alien head with big almond black eyes' },
  { slug: 'av-cat', subject: 'a cute cat face emblem' },
  { slug: 'av-dog', subject: 'a cute dog face emblem' },
  { slug: 'av-fox', subject: 'a fox face emblem' },
  { slug: 'av-panda', subject: 'a panda face emblem' },
  { slug: 'av-frog', subject: 'a cute frog face emblem' },
  { slug: 'av-unicorn', subject: 'a unicorn head with a glowing horn' },
  { slug: 'av-dragon', subject: 'a stylized dragon head' },
  { slug: 'av-trex', subject: 'a green T-rex dinosaur head' },
  { slug: 'av-star', subject: 'a bold five-pointed star' },
  { slug: 'av-fire', subject: 'a single flame / fire' },
  { slug: 'av-rainbow', subject: 'a rainbow arc with a small cloud' },
  { slug: 'av-skull', subject: 'a stylized skull emblem' },
  { slug: 'av-headphones', subject: 'a pair of over-ear headphones' },
  { slug: 'av-donut', subject: 'a frosted donut with colorful sprinkles' },
]

const BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL ?? 'gemini-2.5-flash-image'

interface GeminiPart {
  text?: string
  inlineData?: { data?: string }
  inline_data?: { data?: string }
}
interface GeminiResp {
  candidates?: { content?: { parts?: GeminiPart[] } }[]
}

async function render(apiKey: string, subject: string): Promise<Buffer> {
  const res = await fetch(`${BASE}/${IMAGE_MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: `${subject}.${STYLE}` }] }],
    }),
  })
  if (!res.ok) throw new Error(`gemini ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const json = (await res.json()) as GeminiResp
  for (const cand of json.candidates ?? []) {
    for (const part of cand.content?.parts ?? []) {
      const data = part.inlineData?.data ?? part.inline_data?.data
      if (data) return Buffer.from(data, 'base64')
    }
  }
  throw new Error('gemini: 画像が返りませんでした')
}

/** 同時実行を limit 件に制限して全タスクを実行 */
async function pool<T>(items: T[], limit: number, fn: (t: T) => Promise<void>): Promise<void> {
  let i = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++
      await fn(items[idx])
    }
  })
  await Promise.all(workers)
}

async function main() {
  loadLocalEnv()
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
  if (!apiKey) {
    console.error('✗ GEMINI_API_KEY が未設定です（.dev.vars でも可）')
    process.exit(1)
  }
  await mkdir(OUT_DIR, { recursive: true })

  const argv = process.argv.slice(2)
  const force = argv.includes('--force')
  const only = argv.filter((a) => !a.startsWith('--'))
  const targets = SPRITES.filter((s) => (only.length ? only.includes(s.slug) : true))
  if (!targets.length) {
    console.error(`✗ 対象が見つかりません: ${only.join(', ')}`)
    process.exit(1)
  }

  let made = 0
  let skipped = 0
  let failed = 0
  await pool(targets, 4, async (s) => {
    const out = join(OUT_DIR, `${s.slug}.png`)
    if (existsSync(out) && !force) {
      console.log(`• skip   ${s.slug}`)
      skipped++
      return
    }
    try {
      const png = await render(apiKey, s.subject)
      await writeFile(out, png)
      console.log(`✓ saved  ${s.slug}.png`)
      made++
    } catch (err) {
      console.log(`✗ ${s.slug}: ${(err as Error).message}`)
      failed++
    }
  })

  console.log(`\n完了: 生成 ${made} / スキップ ${skipped} / 失敗 ${failed} / 全 ${targets.length}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
