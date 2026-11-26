// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest'
import { freshState } from '../store/useStore.js'
import { readingsOf } from '../lib/weigh-ins.js'
import { todaySession } from './today.js'
import { readDiet } from './diet.js'
import { seedPlan, seedTestData, seedTestDiet, wipeTestData, wipeTestDiet, hasTestData, TEST_NOTE, TEST_SRC } from './test-data.js'

// Thursday 2026-11-26, 10:00.
const NOW = new Date('2026-11-26T10:00:00').getTime()

describe('SachinFit test data', () => {
  beforeEach(() => localStorage.clear())

  it('plans two weeks of the schedule, no Sundays, one Thursday missed, nothing today', () => {
    const days = seedPlan(NOW)
    expect(days.length).toBe(11)
    expect(days.every(d => new Date(d.iso + 'T12:00:00').getDay() !== 0)).toBe(true)
    expect(days.some(d => d.iso === '2026-11-26')).toBe(false)
    expect(days.map(d => d.iso)).not.toContain('2026-11-12')
  })

  it('logs marked workouts tied to their routine, and weigh-ins down from 110 kg', () => {
    const S = freshState()
    const r = seedTestData(S, NOW)
    expect(r.workouts).toBe(11)
    expect(S.workouts.every(w => w.note === TEST_NOTE && w.routineIds.length === 1)).toBe(true)
    const mon = S.workouts.find(w => w.d === '2026-11-23')
    expect(todaySession(S, '2026-11-23').done).toBe(true)
    expect(mon.name).toBe('Upper A: chest and back')
    const ws = S.bodyweight.slice().sort((a, b) => (a.d < b.d ? -1 : 1)).map(b => b.w)
    expect(ws[0]).toBeGreaterThan(109); expect(ws[0]).toBeLessThan(110.5)
    expect(ws.at(-1)).toBeLessThan(ws[0])
    expect(S.bodyweight.every(b => readingsOf(b).every(x => x.src === TEST_SRC))).toBe(true)
    expect(seedTestData(S, NOW)).toEqual({ workouts: 0, weighIns: 0 })
  })

  it('wipes only what it seeded', () => {
    const S = freshState()
    S.workouts.push({ id: 'real', d: '2026-11-20', name: 'Real', entries: [] })
    seedTestData(S, NOW)
    S.bodyweight.push({ d: '2026-11-26', w: 109.4, t: NOW })
    expect(hasTestData(S)).toBe(true)
    const r = wipeTestData(S, NOW)
    expect(r.workouts).toBe(11)
    expect(S.workouts.map(w => w.id)).toEqual(['real'])
    expect(S.bodyweight.map(b => b.d)).toEqual(['2026-11-26'])
    expect(hasTestData(S)).toBe(false)
  })

  it('seeds diet days on the device, keeps real days, wipes the seeded ones', () => {
    localStorage.setItem('sf_diet_v1', JSON.stringify({ '2026-11-20': { date: '2026-11-20', water: true }, '2026-11-26': { date: '2026-11-26', vegTwice: true } }))
    const days = seedTestDiet(NOW)
    expect(days.length).toBe(13)
    expect(readDiet()['2026-11-20']).toEqual({ date: '2026-11-20', water: true })
    expect(wipeTestDiet()).toBe(13)
    expect(Object.keys(readDiet()).sort()).toEqual(['2026-11-20', '2026-11-26'])
  })
})
