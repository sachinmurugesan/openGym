// SachinFit test data, for trying the app before real use (dev builds only, views/SachinFitTestData.jsx).
// Two weeks of the weekly plan logged as workouts, weigh-ins trending down from 110 kg and diet
// ticks. Every piece is marked so the wipe takes out exactly what the seed put in:
// workouts carry TEST_NOTE, weigh-ins carry src TEST_SRC, and the diet days seeded are listed
// under SEED_KEY. Real entries are never touched.
import { buildLoggedWorkout, appendLoggedWorkout } from '../lib/log-workout.js'
import { addWeighIn, removeWeighIn, readingsOf } from '../lib/weigh-ins.js'
import { WEEKLY_PLAN, loadWeeklyPlan } from './plan.js'
import { DIET_ITEMS, readDiet } from './diet.js'

export const TEST_NOTE = 'SachinFit test data'
export const TEST_SRC = 'sachinfit-test'
const SEED_KEY = 'sf_test_seed_v1'
const DIET_KEY = 'sf_diet_v1'
export const SEED_DAYS = 14

const store = () => { try { return globalThis.localStorage || null } catch { return null } }
const read = (k, f) => { try { return JSON.parse(store()?.getItem(k) || 'null') ?? f } catch { return f } }
const write = (k, v) => { try { store()?.setItem(k, JSON.stringify(v)) } catch { /* full or private */ } }

const isoOf = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const daysBack = (now, n) => { const d = new Date(now); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - n); return d }
// Small fixed pseudo-random numbers, so the same seed day always looks the same.
const rnd = i => { const x = Math.sin(i * 9301 + 49297) * 233280; return x - Math.floor(x) }

// Starting machine weights by position in the session, in kg; week two adds 2.5 kg.
const START_KG = [35, 30, 25, 20, 15, 10]

function setsFor(x, i, week) {
  if (x.min) return [{ minutes: x.min, speed: x.speed || 5 }]
  if (x.sec) return Array.from({ length: x.sets }, () => ({ seconds: x.sec }))
  const kg = START_KG[i % START_KG.length] + (week ? 2.5 : 0)
  return Array.from({ length: x.sets }, (_, j) => ({ reps: Math.max(x.repsMin || 8, (x.reps || 12) - j - (week ? 0 : 1)), weight: kg }))
}

/** The workouts the seed would log: the plan's day for each of the last SEED_DAYS days, one gym day missed. */
export function seedPlan(now = Date.now()) {
  const byDay = new Map(WEEKLY_PLAN.schedule.map(([d, key]) => [Number(d), key]))
  const out = []
  for (let n = SEED_DAYS; n >= 1; n--) {
    const d = daysBack(now, n)
    const key = byDay.get(d.getDay())
    if (!key) continue
    // One missed Thursday in the first week, the way a real fortnight goes.
    if (d.getDay() === 4 && n > 7) continue
    out.push({ iso: isoOf(d), key, week: n <= 7 ? 1 : 0 })
  }
  return out
}

/**
 * Inside store.update: loads the plan if missing, then logs the test workouts and weigh-ins.
 * Returns { workouts, weighIns }, the counts added. Running it twice adds nothing the second time.
 */
export function seedTestData(s, now = Date.now()) {
  loadWeeklyPlan(s)
  let workouts = 0, weighIns = 0
  for (const { iso, key, week } of seedPlan(now)) {
    const session = WEEKLY_PLAN.sessions.find(x => x.key === key)
    const routine = (s.routines || []).find(r => r.name === session.name)
    const built = buildLoggedWorkout(s, {
      date: iso, start: '18:30', durationMin: session.minutes, name: session.name, note: TEST_NOTE,
      exercises: session.exercises.map((x, i) => ({ exercise: x.id, sets: setsFor(x, i, week) })),
    }, { now })
    if (built.problems) continue
    if (routine) built.workout.routineIds = [routine.id]
    if (appendLoggedWorkout(s, built, { now }).added !== false) workouts++
  }
  // Weigh-ins every morning but a few, from 110.0 kg down about 0.7 kg a week, with day-to-day noise.
  for (let n = SEED_DAYS; n >= 1; n--) {
    if (n % 5 === 0) continue
    const iso = isoOf(daysBack(now, n))
    if ((s.bodyweight || []).some(b => b?.d === iso && readingsOf(b).some(r => r.src === TEST_SRC))) continue
    const w = 110 - (SEED_DAYS - n) * 0.1 + (rnd(n) - 0.5) * 0.6
    const t = new Date(iso + 'T07:15:00').getTime()
    if (addWeighIn(s, { d: iso, at: '07:15', w, t, src: TEST_SRC, id: 'sftest-' + iso })) weighIns++
  }
  return { workouts, weighIns }
}

/** Diet ticks for the seeded days (not today), saved on this device. Returns the days written. */
export function seedTestDiet(now = Date.now()) {
  const all = readDiet()
  const seeded = new Set(read(SEED_KEY, {}).diet || [])
  const days = []
  for (let n = SEED_DAYS; n >= 1; n--) {
    const iso = isoOf(daysBack(now, n))
    if (all[iso] && !seeded.has(iso)) continue // a real day stays as it is
    const rec = { date: iso }
    DIET_ITEMS.forEach(({ key }, i) => { rec[key] = rnd(n * 7 + i) < 0.7 })
    all[iso] = rec
    days.push(iso)
  }
  write(DIET_KEY, all)
  write(SEED_KEY, { diet: [...new Set([...seeded, ...days])] })
  return days
}

/** Inside store.update: removes only the seeded workouts and weigh-ins. Returns the counts removed. */
export function wipeTestData(s, now = Date.now()) {
  const before = (s.workouts || []).length
  s.workouts = (s.workouts || []).filter(w => w?.note !== TEST_NOTE)
  let weighIns = 0
  for (const b of [...(s.bodyweight || [])]) {
    for (const r of readingsOf(b).filter(r => r.src === TEST_SRC)) if (removeWeighIn(s, b.d, r.id, now)) weighIns++
  }
  return { workouts: before - s.workouts.length, weighIns }
}

/** Removes the seeded diet days from this device. Returns how many went. */
export function wipeTestDiet() {
  const seeded = read(SEED_KEY, {}).diet || []
  const all = readDiet()
  for (const d of seeded) delete all[d]
  write(DIET_KEY, all)
  try { store()?.removeItem(SEED_KEY) } catch { /* private mode */ }
  return seeded.length
}

/** Whether any seeded data is on this profile or device. */
export const hasTestData = s => (s?.workouts || []).some(w => w?.note === TEST_NOTE)
  || (s?.bodyweight || []).some(b => readingsOf(b).some(r => r.src === TEST_SRC))
  || (read(SEED_KEY, {}).diet || []).length > 0
