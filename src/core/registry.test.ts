import { describe, it, expect } from 'vitest'
import { games, gameById } from './registry'
import { gameCategorySchema, gameGenreSchema } from './types'

describe('game registry', () => {
  it('1本以上のゲームが登録されている', () => {
    expect(games.length).toBeGreaterThan(0)
  })

  it('id は一意で slug 形式', () => {
    const ids = games.map((g) => g.id)
    expect(new Set(ids).size).toBe(ids.length)
    ids.forEach((id) => expect(id).toMatch(/^[a-z0-9-]+$/))
  })

  it('genre は有効な値で、component は遅延ローダ関数', () => {
    games.forEach((g) => {
      expect(gameGenreSchema.safeParse(g.genre).success).toBe(true)
      if (g.category) {
        expect(gameCategorySchema.safeParse(g.category).success).toBe(true)
      }
      if (g.popularity != null) {
        expect(g.popularity).toBeGreaterThanOrEqual(0)
        expect(g.popularity).toBeLessThanOrEqual(100)
      }
      expect(typeof g.component).toBe('function')
    })
  })

  it('gameById で id から引ける', () => {
    games.forEach((g) => expect(gameById.get(g.id)).toBe(g))
  })
})
