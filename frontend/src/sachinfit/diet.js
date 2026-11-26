// SachinFit: the daily diet checklist (PRD F9, the six ticks) and the targets you set yourself.
//
// Phase 2 keeps both on this device only (localStorage), on purpose: putting them in the synced
// profile means a new field in the sync format (lib/sync-merge.js and api/sync-stamps.js), and the
// PRD asks for that to be agreed first. Phase 4 moves them into the profile as `dietCheck` records.
// Record shape already matches the PRD: { date, six booleans, kcalEaten?, proteinGrams?, note? }.

export const DIET_ITEMS = [
  { key: 'proteinEveryMeal', label: 'Protein at every meal' },
  { key: 'vegTwice', label: 'Vegetables twice' },
  { key: 'noSugaryDrinks', label: 'No sugary drinks' },
  { key: 'dinnerProtein', label: 'Protein with dinner' },
  { key: 'water', label: 'Water through the day' },
  { key: 'noSnacksAtHome', label: 'No snacks kept at home' },
]

// Your own numbers (PRD: targets are numbers you set). The app suggests nothing beyond them.
export const DEFAULT_TARGETS = { steps: 8000, kcalMin: 2000, kcalMax: 2100, proteinMin: 150, proteinMax: 165 }

const DIET_KEY = 'sf_diet_v1'
const TARGET_KEY = 'sf_targets_v1'
const KEEP_DAYS = 400
const ISO = /^\d{4}-\d{2}-\d{2}$/
const isMap = v => !!v && typeof v === 'object' && !Array.isArray(v)

const store = () => { try { return globalThis.localStorage || null } catch { return null } }
const read = (key, fallback) => { try { const v = JSON.parse(store()?.getItem(key) || 'null'); return v ?? fallback } catch { return fallback } }
const write = (key, v) => { try { store()?.setItem(key, JSON.stringify(v)) } catch { /* full or private */ } }

/** All days, { [iso]: record }. */
export function readDiet() {
  const all = read(DIET_KEY, {})
  return isMap(all) ? all : {}
}

/** One day's record, every item present (false when not ticked). */
export function dietDay(all, iso) {
  const rec = isMap(all?.[iso]) ? all[iso] : {}
  const out = { date: iso }
  for (const { key } of DIET_ITEMS) out[key] = rec[key] === true
  if (Number(rec.kcalEaten) > 0) out.kcalEaten = Number(rec.kcalEaten)
  if (Number(rec.proteinGrams) > 0) out.proteinGrams = Number(rec.proteinGrams)
  if (typeof rec.note === 'string' && rec.note) out.note = rec.note
  return out
}

/** Ticks done out of six. */
export const dietScore = rec => DIET_ITEMS.reduce((n, { key }) => n + (rec?.[key] === true ? 1 : 0), 0)

/** A copy of `all` with one item of `iso` flipped (or set to `value`), old days trimmed. Pure. */
export function toggledDiet(all, iso, key, value) {
  if (!ISO.test(iso) || !DIET_ITEMS.some(i => i.key === key)) return all
  const day = dietDay(all, iso)
  day[key] = value === undefined ? !day[key] : !!value
  const next = { ...(isMap(all) ? all : {}), [iso]: day }
  const days = Object.keys(next).filter(d => ISO.test(d)).sort()
  for (const d of days.slice(0, Math.max(0, days.length - KEEP_DAYS))) delete next[d]
  return next
}

export function toggleDietItem(iso, key, value) {
  const next = toggledDiet(readDiet(), iso, key, value)
  write(DIET_KEY, next)
  return next
}

/** Targets with every field present and sane. */
export function cleanTargets(t) {
  const out = { ...DEFAULT_TARGETS }
  if (!isMap(t)) return out
  const n = (v, lo, hi) => { const x = Math.round(Number(v)); return Number.isFinite(x) && x >= lo && x <= hi ? x : null }
  out.steps = n(t.steps, 500, 50000) ?? out.steps
  out.kcalMin = n(t.kcalMin, 800, 6000) ?? out.kcalMin
  out.kcalMax = Math.max(out.kcalMin, n(t.kcalMax, 800, 6000) ?? out.kcalMax)
  out.proteinMin = n(t.proteinMin, 10, 400) ?? out.proteinMin
  out.proteinMax = Math.max(out.proteinMin, n(t.proteinMax, 10, 400) ?? out.proteinMax)
  return out
}

export const readTargets = () => cleanTargets(read(TARGET_KEY, null))
export function saveTargets(t) { const c = cleanTargets(t); write(TARGET_KEY, c); return c }
