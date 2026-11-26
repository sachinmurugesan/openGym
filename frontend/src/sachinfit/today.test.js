// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { freshState } from '../store/useStore.js'
import { loadWeeklyPlan } from './plan.js'
import { todaySession, stepsToday, sleepHours, activeKcal, stepBaseline, suggestedStepTarget, progressOf } from './today.js'

// 2026-11-23 is a Monday.
const MON = '2026-11-23', WED = '2026-11-25', SAT = '2026-11-28', SUN = '2026-11-29'
const planned = () => { const S = freshState(); loadWeeklyPlan(S); return S }

describe('todaySession (F6)', () => {
  it('shows Monday’s Upper A as a gym day of 40 minutes', () => {
    const x = todaySession(planned(), MON)
    expect(x.routines.map(r => r.name)).toEqual(['Upper A: chest and back'])
    expect(x).toMatchObject({ kind: 'gym', minutes: 40, done: false, exercises: 6 })
  })

  it('shows Wednesday as a light day', () => {
    expect(todaySession(planned(), WED)).toMatchObject({ kind: 'light', minutes: 25 })
  })

  it('offers the light circuit beside Saturday’s long walk', () => {
    const x = todaySession(planned(), SAT)
    expect(x.routines.map(r => r.name)).toEqual(['Long walk'])
    expect(x.alt.map(r => r.name)).toEqual(['Light circuit'])
  })

  it('shows Sunday as rest', () => {
    expect(todaySession(planned(), SUN)).toMatchObject({ kind: 'rest', routines: [], done: false })
  })

  it('is done once a workout of today covers the routine', () => {
    const S = planned()
    const id = S.week[1][0]
    S.workouts = [{ id: 'w1', d: MON, routineIds: [id], entries: [] }]
    expect(todaySession(S, MON).done).toBe(true)
    expect(todaySession(S, '2026-11-30').done).toBe(false)
  })

  it('follows a day you moved (a rest override)', () => {
    const S = planned()
    S.dayPlan[MON] = 'rest'
    expect(todaySession(S, MON).kind).toBe('rest')
  })
})

describe('the four numbers', () => {
  const vitals = { days: { [MON]: { steps: 6234.4, sleepMin: 395 }, '2026-11-20': { steps: 5000 }, '2026-11-21': { steps: 6000 }, '2026-11-22': { steps: 7000 } } }
  it('reads steps and sleep from the phone’s vitals', () => {
    expect(stepsToday(vitals, MON)).toBe(6234)
    expect(sleepHours(vitals, MON)).toBe(6.6)
    expect(stepsToday(vitals, WED)).toBeNull()
    expect(sleepHours(null, MON)).toBeNull()
  })
  it('has no active calories until the watch sync stores them', () => {
    expect(activeKcal(null, MON)).toBeNull()
    expect(activeKcal({ [MON]: { activeKcal: 412.6 } }, MON)).toBe(413)
  })
  it('suggests baseline + 1,500, capped at 8,000, from 3 days or more', () => {
    expect(stepBaseline(vitals, MON)).toBe(6000)
    expect(suggestedStepTarget(6000)).toBe(7500)
    expect(suggestedStepTarget(7200)).toBe(8000)
    expect(suggestedStepTarget(null)).toBeNull()
    expect(stepBaseline({ days: { '2026-11-22': { steps: 7000 } } }, MON)).toBeNull()
  })
  it('caps progress at 1', () => {
    expect(progressOf(4000, 8000)).toBe(0.5)
    expect(progressOf(9000, 8000)).toBe(1)
    expect(progressOf(null, 8000)).toBeNull()
  })
})
