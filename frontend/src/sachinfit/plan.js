// SachinFit F8: the preloaded Monday-to-Saturday plan (docs/dev/SACHINFIT_PRD.md, "Weekly plan
// template"). The plan lives in weekly-plan.json in the routines-library file shape, so it reads
// like any other routine file. On first run it is merged into the profile through the same path a
// shared plan takes (lib/plan-share.js mergePlan): new routines with fresh ids, nothing of yours
// overwritten. Pure and framework-free, tested beside it (plan.test.js).
import PLAN from './weekly-plan.json'
import { mergePlan } from '../lib/plan-share.js'

export const WEEKLY_PLAN = PLAN
// Bumped only if the plan itself changes in a way that should be offered again.
export const PLAN_VERSION = 1
const LOADED_KEY = 'sf_plan_loaded_v1'

// Gym days progress by double progression: work 10 to 12 at one weight, all sets at 12 and the
// weight goes up next time (lib/progression.js 'double').
const GLYPH = { gym: 'figureStrength', light: 'figureRun' }

/** One exercise line of the plan file as a routine entry. */
export function planEntry(x) {
  if (x.min) return { id: x.id, sets: x.sets || 1, mode: 'cardio', min: x.min, speed: x.speed || 5, ...(x.note ? { note: x.note } : {}) }
  const base = x.sec
    ? { id: x.id, sets: x.sets, mode: 'time', sec: x.sec, weight: 0 }
    : { id: x.id, sets: x.sets, mode: 'reps', reps: x.reps, weight: 0, ...(x.repsMin ? { repsMin: x.repsMin, repsMax: x.reps, prog: 'double' } : {}) }
  if (x.rest) base.restSec = x.rest
  if (x.note) base.note = x.note
  return base
}

/** The plan file as the bundle lib/plan-share.js mergePlan takes, with the schedule as `week`. */
export function planBundle(plan = PLAN) {
  const routines = plan.sessions.map(s => ({
    id: s.key, name: s.name, emoji: GLYPH[s.kind] || GLYPH.gym, ex: s.exercises.map(planEntry),
  }))
  const week = {}
  for (const [day, key] of plan.schedule) week[day] = [key]
  return { name: plan.title, summary: plan.description, week, routines }
}

/** Every catalogue id the plan uses, once each. */
export const planExerciseIds = (plan = PLAN) => [...new Set(plan.sessions.flatMap(s => s.exercises.map(x => x.id)))]

/** Whether this profile already has the plan: a routine named like each of its sessions. */
export function hasPlan(S, plan = PLAN) {
  const names = new Set((S?.routines || []).map(r => r.name))
  return plan.sessions.every(s => names.has(s.name))
}

const store = () => { try { return globalThis.localStorage || null } catch { return null } }
export const markedLoaded = () => store()?.getItem(LOADED_KEY) === String(PLAN_VERSION)
export const markLoaded = () => { try { store()?.setItem(LOADED_KEY, String(PLAN_VERSION)) } catch { /* private mode */ } }

/**
 * Inside store.update: adds the plan's routines and sets the week to it. Does nothing when the
 * profile already has the plan. Returns true when it loaded.
 */
export function loadWeeklyPlan(s, plan = PLAN) {
  if (hasPlan(s, plan)) return false
  s.routines = s.routines || []
  s.week = s.week || {}
  mergePlan(s, planBundle(plan), { schedule: true })
  return true
}

/** Session meta (kind, minutes, key) for a routine name, or null for a routine not from the plan. */
export function sessionMeta(name, plan = PLAN) {
  const s = plan.sessions.find(x => x.name === name)
  return s ? { key: s.key, kind: s.kind, minutes: s.minutes } : null
}

/** The plan's alternative routines for a weekday (Saturday's light circuit), as names. */
export function alternativesFor(weekday, plan = PLAN) {
  const keys = plan.alternatives?.[String(weekday)] || []
  return keys.map(k => plan.sessions.find(s => s.key === k)?.name).filter(Boolean)
}
