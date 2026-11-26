// SachinFit F6: what the Today screen shows, as pure helpers (tested in today.test.js). The view
// (views/Today.jsx) only renders these: today's session, four numbers and the diet checklist.
import { effectiveRoutines } from '../lib/history.js'
import { sessionMeta, alternativesFor } from './plan.js'

const isMap = v => !!v && typeof v === 'object' && !Array.isArray(v)

/**
 * Today's session: the routines the plan puts on `iso` (a day override or the queue win, exactly
 * as on Home), what kind of day it is, about how long, whether it is logged already, and the
 * plan's alternative for that weekday (Saturday's light circuit) when you have that routine.
 */
export function todaySession(S, iso) {
  const routines = effectiveRoutines(S, iso)
  const weekday = new Date(iso + 'T12:00:00').getDay()
  const logged = (S.workouts || []).filter(w => w.d === iso)
  const covered = id => logged.some(w => (Array.isArray(w.routineIds) ? w.routineIds : [w.routineId]).includes(id))
  const done = routines.length > 0 && routines.every(r => covered(r.id))
  const metas = routines.map(r => sessionMeta(r.name))
  const kind = !routines.length ? 'rest' : metas.some(m => m?.kind === 'gym') ? 'gym' : metas.every(m => m?.kind === 'light') ? 'light' : 'gym'
  const minutes = metas.reduce((n, m) => n + (m?.minutes || 0), 0) || null
  const altNames = alternativesFor(weekday)
  const alt = (S.routines || []).filter(r => altNames.includes(r.name) && !routines.some(x => x.id === r.id))
  return { routines, kind, minutes, done, alt, weekday, exercises: routines.reduce((n, r) => n + (r.ex?.length || 0), 0) }
}

/** The vitals day record from the phone's health file (lib/vitals.js), or null. */
export const vitalsDay = (vitals, iso) => (isMap(vitals?.days) && isMap(vitals.days[iso]) ? vitals.days[iso] : null)

/** Steps today from the phone's health store, or null when nothing has been read. */
export function stepsToday(vitals, iso) {
  const n = Number(vitalsDay(vitals, iso)?.steps)
  return n > 0 ? Math.round(n) : null
}

/** Hours slept the night that ended on `iso`, one decimal, or null. */
export function sleepHours(vitals, iso) {
  const m = Number(vitalsDay(vitals, iso)?.sleepMin)
  return m > 0 ? Math.round((m / 60) * 10) / 10 : null
}

/** Active calories today, once the activity sync stores them (Phase 3, F7). Null until then. */
export function activeKcal(daily, iso) {
  const n = Number(daily?.[iso]?.activeKcal)
  return n > 0 ? Math.round(n) : null
}

/** The average of the days before `iso` with steps, over the last `days`, or null under 3 days. */
export function stepBaseline(vitals, iso, days = 14) {
  if (!isMap(vitals?.days)) return null
  const from = new Date(iso + 'T12:00:00'); from.setDate(from.getDate() - days)
  const lo = from.toISOString().slice(0, 10)
  const xs = Object.entries(vitals.days).filter(([d, v]) => d < iso && d >= lo && Number(v?.steps) > 0).map(([, v]) => Number(v.steps))
  return xs.length >= 3 ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null
}

/**
 * The step target your own rule gives: the baseline plus 1,500, rounded to 100, never above the
 * ceiling (8,000 by default). Null without a baseline. A suggestion only; the target is yours to set.
 */
export function suggestedStepTarget(baseline, { add = 1500, ceiling = 8000 } = {}) {
  if (!(baseline > 0)) return null
  return Math.min(ceiling, Math.round((baseline + add) / 100) * 100)
}

/** Progress 0..1 of a value against a target, null when either is missing. */
export const progressOf = (value, target) => (value > 0 && target > 0 ? Math.min(1, value / target) : null)
