/**
 * ミニゲームのカードアイコンを生成するスクリプト (2段生成 + キャッシュ)。
 *
 *   段1: ChatGPT (gpt-4o) に各ゲームの title/description/genre を渡し、
 *        統一画風のアイコン生成プロンプト(英語)を設計させる。
 *   段2: gpt-image-1 にそのプロンプトを投げ、透過 PNG を取得して
 *        public/icons/<id>.png に保存する。
 *
 * 使い方:
 *   OPENAI_API_KEY=sk-... npm run gen:icons          # 未生成のものだけ
 *   OPENAI_API_KEY=sk-... npm run gen:icons -- --force      # 全部作り直し
 *   OPENAI_API_KEY=sk-... npm run gen:icons -- 2048 snake   # 指定 id だけ
 *
 * 注意: gpt-image-1 は OpenAI 側で組織の本人確認 (verification) が必要な場合があります。
 */
import { writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { games } from '../src/core/registry'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ICONS_DIR = join(__dirname, '..', 'public', 'icons')

const API_KEY = process.env.OPENAI_API_KEY
if (!API_KEY) {
  console.error('✗ OPENAI_API_KEY が未設定です。例: OPENAI_API_KEY=sk-... npm run gen:icons')
  process.exit(1)
}

// CLI 引数: --force と、任意の id 群
const argv = process.argv.slice(2)
const force = argv.includes('--force')
const onlyIds = argv.filter((a) => !a.startsWith('--'))

// 全アイコン共通の画風。ここを変えると全体のトーンが揃って変わる。
const STYLE_GUIDE = [
  'A single mobile game icon.',
  'Flat, modern, bold and simple shapes with clean thick outlines.',
  'Centered subject, filling the frame, no padding text.',
  'Vibrant neon arcade aesthetic on a dark sleek UI, glossy highlights.',
  'Transparent background. No text, no letters, no numbers, no words.',
  'Consistent art style across a set of icons for one game portal.',
].join(' ')

/** 段1: ChatGPT にアイコン用の英語プロンプトを設計させる */
async function designPrompt(game: (typeof games)[number]): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content:
            'You design concise English prompts for an image generator that creates game-card icons. ' +
            'Output ONLY the final image prompt, one paragraph, no preamble, no quotes. ' +
            'Always incorporate this fixed style: ' +
            STYLE_GUIDE,
        },
        {
          role: 'user',
          content:
            `Game title: ${game.title}\n` +
            `Genre: ${game.genre}\n` +
            `Description (Japanese): ${game.description}\n` +
            `Current emoji thumbnail (for reference of the motif): ${game.thumbnail}\n\n` +
            'Write the image prompt for this game\'s icon. ' +
            'Pick a single clear iconic subject that represents the game at a glance.',
        },
      ],
    }),
  })
  if (!res.ok) {
    throw new Error(`chat ${res.status}: ${await res.text()}`)
  }
  const json = (await res.json()) as {
    choices: { message: { content: string } }[]
  }
  return json.choices[0].message.content.trim()
}

/** 段2: gpt-image-1 で透過 PNG を生成し Buffer で返す */
async function renderIcon(prompt: string): Promise<Buffer> {
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt,
      size: '1024x1024',
      quality: process.env.ICON_QUALITY ?? 'medium',
      background: 'transparent',
      n: 1,
    }),
  })
  if (!res.ok) {
    throw new Error(`image ${res.status}: ${await res.text()}`)
  }
  const json = (await res.json()) as { data: { b64_json: string }[] }
  return Buffer.from(json.data[0].b64_json, 'base64')
}

async function main() {
  await mkdir(ICONS_DIR, { recursive: true })

  const targets = games.filter((g) => (onlyIds.length ? onlyIds.includes(g.id) : true))
  if (!targets.length) {
    console.error(`✗ 対象ゲームが見つかりません。指定: ${onlyIds.join(', ')}`)
    process.exit(1)
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
      const prompt = await designPrompt(game)
      process.stdout.write('render … ')
      const png = await renderIcon(prompt)
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
