/**
 * ミニゲームのカードアイコンを生成するスクリプト (2段生成 + キャッシュ)。
 *
 *   段1: テキストLLM に各ゲームの title/description/genre を渡し、
 *        統一画風のアイコン生成プロンプト(英語)を設計させる。
 *   段2: 画像モデルにそのプロンプトを投げ、PNG を取得して
 *        public/icons/<id>.png に保存する。
 *
 * プロバイダは2種類。鍵の設定状況で自動選択 (明示は ICON_PROVIDER=gemini|openai)。
 *   - Gemini (推奨): gemini-2.5-flash-image (Nano Banana)。OpenAI不要。
 *       GEMINI_API_KEY=... npm run gen:icons
 *   - OpenAI: gpt-image-1 (組織の本人確認が必要な場合あり)。
 *       OPENAI_API_KEY=sk-... npm run gen:icons
 *
 * 使い方:
 *   GEMINI_API_KEY=... npm run gen:icons                 # 未生成のものだけ
 *   GEMINI_API_KEY=... npm run gen:icons -- --force      # 全部作り直し
 *   GEMINI_API_KEY=... npm run gen:icons -- 2048 snake   # 指定 id だけ
 */
import { writeFile, mkdir } from 'node:fs/promises'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { games } from '../src/core/registry'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ICONS_DIR = join(__dirname, '..', 'public', 'icons')

/**
 * 鍵をコマンドラインや会話に貼らずに済むよう、環境変数が未設定なら
 * gitignore 済みの .dev.vars から KEY=value を読み込む (既存の env を上書きしない)。
 */
function loadLocalEnv(): void {
  if (process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY) return
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

// CLI 引数: --force と、任意の id 群
const argv = process.argv.slice(2)
const force = argv.includes('--force')
const onlyIds = argv.filter((a) => !a.startsWith('--'))

// 全アイコン共通の画風。ここを変えると全体のトーンが揃って変わる。
const STYLE_GUIDE = [
  'A single modern mobile game icon, centered, filling the frame.',
  'Flat geometric design with clean bold shapes and crisp edges.',
  'Cohesive "cyber arcade" icon set: violet (#8B5CF6) and cyan (#22D3EE) neon accents',
  'with a subtle glow, on a deep dark theme. Premium, sleek and restrained —',
  'not cartoonish, not overly glossy, no heavy 3D bevels.',
  'No text, no letters, no numbers, no words, no UI frames.',
  'Consistent lighting, palette and stroke weight across the whole icon set.',
].join(' ')

// 画像モデルへ毎回添える出力指定 (背景・余白を揃える)。
const RENDER_SUFFIX =
  ' Render on a solid near-black background (#080B14) with a small even margin around the subject, square 1:1 composition. Output a single image only.'

type Game = (typeof games)[number]

interface Provider {
  readonly name: string
  /** 段1: ゲーム情報からアイコン用の英語プロンプトを設計 */
  designPrompt(game: Game): Promise<string>
  /** 段2: プロンプトから PNG (Buffer) を生成 */
  renderIcon(prompt: string): Promise<Buffer>
}

/** 段1 共通のユーザープロンプト (どのプロバイダでも同じ意図) */
function designUserPrompt(game: Game): string {
  return (
    `Game title: ${game.title}\n` +
    `Genre: ${game.genre}\n` +
    `Description (Japanese): ${game.description}\n` +
    `Current emoji thumbnail (for reference of the motif): ${game.thumbnail}\n\n` +
    "Write the image prompt for this game's icon. " +
    'Pick a single clear iconic subject that represents the game at a glance.'
  )
}

const DESIGN_SYSTEM =
  'You design concise English prompts for an image generator that creates game-card icons. ' +
  'Output ONLY the final image prompt, one paragraph, no preamble, no quotes. ' +
  'Always incorporate this fixed style: ' +
  STYLE_GUIDE

// ── Gemini (gemini-2.5-flash-image / Nano Banana) ──
function geminiProvider(apiKey: string): Provider {
  const BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
  const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL ?? 'gemini-2.5-flash'
  const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL ?? 'gemini-2.5-flash-image'

  async function call(model: string, body: unknown): Promise<{ candidates?: GeminiCandidate[] }> {
    const res = await fetch(`${BASE}/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      throw new Error(`gemini ${model} ${res.status}: ${await res.text()}`)
    }
    return (await res.json()) as { candidates?: GeminiCandidate[] }
  }

  return {
    name: 'gemini',
    async designPrompt(game) {
      const json = await call(TEXT_MODEL, {
        systemInstruction: { parts: [{ text: DESIGN_SYSTEM }] },
        contents: [{ role: 'user', parts: [{ text: designUserPrompt(game) }] }],
        generationConfig: { temperature: 0.4 },
      })
      const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('').trim()
      if (!text) throw new Error('gemini: 段1で空のプロンプトが返りました')
      return text
    },
    async renderIcon(prompt) {
      const json = await call(IMAGE_MODEL, {
        contents: [{ role: 'user', parts: [{ text: prompt + RENDER_SUFFIX }] }],
      })
      for (const cand of json.candidates ?? []) {
        for (const part of cand.content?.parts ?? []) {
          const data = part.inlineData?.data ?? part.inline_data?.data
          if (data) return Buffer.from(data, 'base64')
        }
      }
      const text = (json.candidates ?? [])
        .flatMap((c) => c.content?.parts ?? [])
        .map((p) => p.text ?? '')
        .join(' ')
        .slice(0, 200)
      throw new Error(`gemini: 画像が返りませんでした (text: ${text})`)
    },
  }
}

// ── OpenAI (gpt-4o + gpt-image-1) ──
function openaiProvider(apiKey: string): Provider {
  return {
    name: 'openai',
    async designPrompt(game) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o',
          temperature: 0.4,
          messages: [
            { role: 'system', content: DESIGN_SYSTEM },
            { role: 'user', content: designUserPrompt(game) },
          ],
        }),
      })
      if (!res.ok) throw new Error(`chat ${res.status}: ${await res.text()}`)
      const json = (await res.json()) as { choices: { message: { content: string } }[] }
      return json.choices[0].message.content.trim()
    },
    async renderIcon(prompt) {
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'gpt-image-1',
          prompt,
          size: '1024x1024',
          quality: process.env.ICON_QUALITY ?? 'medium',
          background: 'transparent',
          n: 1,
        }),
      })
      if (!res.ok) throw new Error(`image ${res.status}: ${await res.text()}`)
      const json = (await res.json()) as { data: { b64_json: string }[] }
      return Buffer.from(json.data[0].b64_json, 'base64')
    },
  }
}

interface GeminiPart {
  text?: string
  inlineData?: { data?: string }
  inline_data?: { data?: string }
}
interface GeminiCandidate {
  content?: { parts?: GeminiPart[] }
}

/** 鍵の設定状況からプロバイダを選ぶ (明示は ICON_PROVIDER)。 */
function pickProvider(): Provider {
  const explicit = process.env.ICON_PROVIDER?.toLowerCase()
  const gem = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
  const oai = process.env.OPENAI_API_KEY

  if (explicit === 'gemini') {
    if (!gem) fail('ICON_PROVIDER=gemini ですが GEMINI_API_KEY が未設定です')
    return geminiProvider(gem!)
  }
  if (explicit === 'openai') {
    if (!oai) fail('ICON_PROVIDER=openai ですが OPENAI_API_KEY が未設定です')
    return openaiProvider(oai!)
  }
  // 自動: Gemini 優先 (OpenAI は本人確認が要る場合があるため)
  if (gem) return geminiProvider(gem)
  if (oai) return openaiProvider(oai)
  fail('GEMINI_API_KEY か OPENAI_API_KEY のどちらかを設定してください。例: GEMINI_API_KEY=... npm run gen:icons')
}

function fail(msg: string): never {
  console.error(`✗ ${msg}`)
  process.exit(1)
}

async function main() {
  loadLocalEnv()
  const provider = pickProvider()
  console.log(`プロバイダ: ${provider.name}\n`)
  await mkdir(ICONS_DIR, { recursive: true })

  const targets = games.filter((g) => (onlyIds.length ? onlyIds.includes(g.id) : true))
  if (!targets.length) {
    fail(`対象ゲームが見つかりません。指定: ${onlyIds.join(', ')}`)
  }

  let made = 0
  let skipped = 0
  for (const game of targets) {
    const out = join(ICONS_DIR, `${game.id}.png`)
    if (existsSync(out) && !force) {
      console.log(`• skip   ${game.id} (既存。作り直すなら --force)`)
      skipped++
      continue
    }
    try {
      process.stdout.write(`… design ${game.id} … `)
      const prompt = await provider.designPrompt(game)
      process.stdout.write('render … ')
      const png = await provider.renderIcon(prompt)
      await writeFile(out, png)
      console.log(`✓ saved public/icons/${game.id}.png`)
      made++
    } catch (err) {
      console.log(`✗ ${game.id}: ${(err as Error).message}`)
    }
  }

  console.log(`\n完了: 生成 ${made} / スキップ ${skipped} / 全 ${targets.length}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
