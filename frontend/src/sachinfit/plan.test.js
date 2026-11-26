// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { EXIDX } from '../lib/exercises.js'
import { freshState } from '../store/useStore.js'
import { WEEKLY_PLAN, planBundle, planEntry, planExerciseIds, hasPlan, loadWeeklyPlan, sessionMeta, alternativesFor } from './plan.js'

const byName = (S, name) => S.routines.find(r => r.name === name)

describe('the SachinFit weekly plan (F8)', () => {
  it('uses only exercises that exist in the catalogue, so every one has its animation', () => {
    const missing = planExerciseIds().filter(id => !EXIDX[id])
    expect(missing).toEqual([])
  })

  it('is Monday to Saturday with Sunday free', () => {
    const days = WEEKLY_PLAN.schedule.map(([d]) => d)
    expect(days).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('gives the gym days 3 sets of 10 to 12 on double progression, 60 to 90 s rest', () => {
    const gym = WEEKLY_PLAN.sessions.filter(s => s.kind === 'gym')
    expect(gym.map(s => s.key)).toEqual(['upperA', 'lowerA', 'upperB', 'lowerB'])
    for (const s of gym) {
      for (const x of s.exercises.filter(x => x.reps && x.id !== '0276')) {
        const e = planEntry(x)
        expect(e).toMatchObject({ sets: 3, reps: 12, repsMin: 10, repsMax: 12, prog: 'double', mode: 'reps' })
        expect(e.restSec).toBeGreaterThanOrEqual(60)
        expect(e.restSec).toBeLessThanOrEqual(90)
      }
    }
  })

  it('writes cardio lines as minutes and the Pallof press as a hold', () => {
    expect(planEntry({ id: '0798', sets: 1, min: 5 })).toMatchObject({ mode: 'cardio', min: 5 })
    expect(planEntry({ id: '1202', sets: 3, sec: 30 })).toMatchObject({ mode: 'time', sec: 30 })
  })

  it('loads into a fresh profile with the week set, once', () => {
    const S = freshState()
    expect(hasPlan(S)).toBe(false)
    expect(loadWeeklyPlan(S)).toBe(true)
    expect(S.routines).toHaveLength(WEEKLY_PLAN.sessions.length)
    expect(S.week[1]).toEqual([byName(S, 'Upper A: chest and back').id])
    expect(S.week[3]).toEqual([byName(S, 'Pool walking').id])
    expect(S.week[6]).toEqual([byName(S, 'Long walk').id])
    expect(S.week[0]).toBeUndefined()
    expect(loadWeeklyPlan(S)).toBe(false)
    expect(S.routines).toHaveLength(WEEKLY_PLAN.sessions.length)
  })

  it('never touches routines you already have', () => {
    const S = freshState()
    S.routines.push({ id: 'mine', name: 'My own', emoji: 'arm', ex: [{ id: '0576', sets: 5, reps: 5 }] })
    loadWeeklyPlan(S)
    expect(S.routines[0]).toEqual({ id: 'mine', name: 'My own', emoji: 'arm', ex: [{ id: '0576', sets: 5, reps: 5 }] })
  })

  it('keeps the light circuit as Saturday’s alternative, not in the schedule', () => {
    expect(alternativesFor(6)).toEqual(['Light circuit'])
    expect(alternativesFor(1)).toEqual([])
    expect(planBundle().week[6]).toEqual(['walk'])
  })

  it('knows each session’s kind and length', () => {
    expect(sessionMeta('Lower B: legs and core')).toEqual({ key: 'lowerB', kind: 'gym', minutes: 40 })
    expect(sessionMeta('Pool walking').kind).toBe('light')
    expect(sessionMeta('Something else')).toBeNull()
  })
})
