import { describe, it, expect } from 'vitest'
import { sanitizeName, MAX_NAME_LEN } from './leaderboard'

describe('sanitizeName', () => {
  it('前後の空白を除去する', () => {
    expect(sanitizeName('  たろう  ')).toBe('たろう')
  })

  it('改行・連続空白を1つに圧縮する', () => {
    expect(sanitizeName('a\n\tb   c')).toBe('a b c')
  })

  it('最大文字数で切り詰める (コードポイント単位)', () => {
    const long = 'あ'.repeat(20)
    expect([...sanitizeName(long)]).toHaveLength(MAX_NAME_LEN)
  })

  it('絵文字も1文字として数える', () => {
    expect(sanitizeName('😀😀😀')).toBe('😀😀😀')
  })

  it('空文字はそのまま空 (呼び出し側で未設定扱い)', () => {
    expect(sanitizeName('   ')).toBe('')
  })
})
