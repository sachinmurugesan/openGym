// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest'
import { DIET_ITEMS, dietDay, dietScore, toggledDiet, toggleDietItem, readDiet, cleanTargets, saveTargets, readTargets, DEFAULT_TARGETS } from './diet.js'

const D = '2026-11-26'

describe('the diet checklist', () => {
  beforeEach(() => { localStorage.clear() })

  it('has the six PRD items', () => {
    expect(DIET_ITEMS.map(i => i.key)).toEqual(['proteinEveryMeal', 'vegTwice', 'noSugaryDrinks', 'dinnerProtein', 'water', 'noSnacksAtHome'])
  })

  it('starts a day with nothing ticked', () => {
    const d = dietDay({}, D)
    expect(dietScore(d)).toBe(0)
    expect(d.date).toBe(D)
  })

  it('toggles one item without touching the others or other days', () => {
    let all = toggledDiet({}, D, 'water')
    all = toggledDiet(all, D, 'vegTwice')
    all = toggledDiet(all, D, 'water')
    expect(dietDay(all, D)).toMatchObject({ water: false, vegTwice: true })
    expect(dietScore(dietDay(all, D))).toBe(1)
    expect(dietScore(dietDay(all, '2026-11-25'))).toBe(0)
  })

  it('ignores an unknown item or a bad date', () => {
    const all = {}
    expect(toggledDiet(all, D, 'cake')).toBe(all)
    expect(toggledDiet(all, '26/11', 'water')).toBe(all)
  })

  it('keeps the ticks on the device', () => {
    toggleDietItem(D, 'noSugaryDrinks')
    expect(dietDay(readDiet(), D).noSugaryDrinks).toBe(true)
  })

  it('survives a broken store', () => {
    localStorage.setItem('sf_diet_v1', '{not json')
    expect(readDiet()).toEqual({})
  })
})

describe('targets', () => {
  beforeEach(() => { localStorage.clear() })
  it('defaults to the plan’s numbers', () => {
    expect(readTargets()).toEqual({ steps: 8000, kcalMin: 2000, kcalMax: 2100, proteinMin: 150, proteinMax: 165 })
  })
  it('keeps a range in order and drops nonsense', () => {
    expect(cleanTargets({ steps: 'x', kcalMin: 2200, kcalMax: 2000 })).toMatchObject({ steps: DEFAULT_TARGETS.steps, kcalMin: 2200, kcalMax: 2200 })
  })
  it('saves', () => {
    saveTargets({ steps: 6500 })
    expect(readTargets().steps).toBe(6500)
  })
})
