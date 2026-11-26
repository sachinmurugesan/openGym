// SachinFit F6, the Today screen (docs/dev/SACHINFIT_DESIGN.md): one question, answered in under
// ten seconds: what do I do today, and did I do it. Today's session with one Start button, four
// numbers (steps, active calories, sleep, diet ticks) and the diet checklist. Nothing else.
// The logic lives in src/sachinfit/ (pure, tested); this file only renders it.
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore.js'
import { todayISO, fmtNum } from '../lib/format.js'
import { t, tn } from '../lib/i18n.js'
import { MOBILE } from '../lib/mobile.js'
import { loadHealth, onHealthChange } from '../lib/health-sync.js'
import Icon from '../components/Icon.jsx'
import { Stepper } from '../components/ui.jsx'
import { startOrPreview } from '../components/StartSheets.jsx'
import { loadWeeklyPlan, markLoaded, markedLoaded } from '../sachinfit/plan.js'
import { todaySession, stepsToday, sleepHours, activeKcal, stepBaseline, suggestedStepTarget, progressOf } from '../sachinfit/today.js'
import { DIET_ITEMS, readDiet, dietDay, dietScore, toggleDietItem, readTargets, saveTargets } from '../sachinfit/diet.js'
import './Today.css'

// The SachinFit copy goes through t() at run time, so a language pack can translate it later,
// without adding 25 packs' worth of keys now (check-source-strings only collects literal t() calls).
const tr = (s, ...args) => t(s, ...args)
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function Tile({ icon, tint, label, value, unit, foot, progress, onClick, ariaLabel }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag className={'sf-tile' + (onClick ? ' tap' : '')} onClick={onClick} aria-label={ariaLabel} type={onClick ? 'button' : undefined}>
      <span className="sf-tile-lbl"><Icon name={icon} style={{ color: tint }} aria-hidden="true" />{label}</span>
      <span className="sf-tile-val">{value ?? '–'}{value != null && unit ? <small>{unit}</small> : null}</span>
      {progress != null && <span className="sf-bar" aria-hidden="true"><span style={{ transform: `scaleX(${progress})`, background: tint }} /></span>}
      <span className="sf-tile-foot">{foot}</span>
    </Tag>
  )
}

export default function Today() {
  const nav = useNavigate()
  const S = useStore(s => s.S)
  const update = useStore(s => s.update)
  const iso = todayISO()

  // F8: the weekly plan arrives on first run, once per device and only if it is not there yet.
  useEffect(() => {
    if (markedLoaded()) return
    update(s => { loadWeeklyPlan(s) })
    markLoaded()
  }, [update])

  // Steps and sleep from Health Connect, read by the existing vitals switch (lib/vitals.js).
  const [health, setHealth] = useState(null)
  useEffect(() => {
    if (!MOBILE) return
    let gone = false
    loadHealth().then(f => { if (!gone) setHealth(f) }).catch(() => {})
    const off = onHealthChange(f => { if (!gone) setHealth(f) })
    return () => { gone = true; off() }
  }, [])
  const vitals = health?.readVitals ? health.vitals : null

  const [diet, setDiet] = useState(readDiet)
  const [targets, setTargets] = useState(readTargets)
  const [editSteps, setEditSteps] = useState(false)

  const session = useMemo(() => todaySession(S, iso), [S, iso])
  const day = dietDay(diet, iso)
  const score = dietScore(day)
  const steps = stepsToday(vitals, iso)
  const sleep = sleepHours(vitals, iso)
  const kcal = activeKcal(null, iso)
  const suggested = suggestedStepTarget(stepBaseline(vitals, iso))
  const noWatch = MOBILE ? tr('Turn on Health Connect vitals') : tr('Shows on your phone')

  const start = ids => { if (S.active) nav('/workout'); else startOrPreview(ids) }
  const main = session.routines
  const title = S.active ? S.active.name : main.length ? main.map(r => r.name).join(' + ') : tr('Rest day')
  const sub = S.active ? tr('In progress')
    : session.done ? tr('Done. Nice work.')
      : main.length ? [tn('1 exercise', '{0} exercises', session.exercises), session.minutes ? tr('about {0} min', String(session.minutes)) : null].filter(Boolean).join(' · ')
        : session.weekday === 0 ? tr('Weekly review and batch cooking') : tr('Nothing planned today')

  const now = new Date(iso + 'T12:00:00')
  const dateLine = tr(DAY_NAMES[now.getDay()]) + ' ' + now.getDate() + ' ' + now.toLocaleDateString(undefined, { month: 'long' })

  return (
    <div className="sf-today">
      <header className="hdr sf-hdr">
        <div>
          <div className="sub">{dateLine}</div>
          <h1>{tr('Today')}</h1>
        </div>
        <button type="button" className="iconbtn" onClick={() => nav('/home')} aria-label={tr('Open the full home screen')}><Icon name="grid" /></button>
      </header>

      <div className="sf-grid">
        <section className={'sf-session card' + (session.done ? ' done' : '') + (session.kind === 'rest' && !S.active ? ' rest' : '')} aria-labelledby="sf-session-title">
          <div className="sf-kicker">{S.active ? tr('Workout') : session.kind === 'gym' ? tr('Gym day') : session.kind === 'light' ? tr('Light day') : tr('Rest')}</div>
          <h2 id="sf-session-title" className="sf-session-title">{title}</h2>
          <p className="sf-session-sub">{sub}</p>
          {S.active ? <button type="button" className="btn primary sf-go" onClick={() => nav('/workout')}><Icon name="play" />{tr('Resume')}</button>
            : main.length && !session.done ? <button type="button" className="btn primary sf-go" onClick={() => start(main.map(r => r.id))}><Icon name="play" />{tr('Start')}</button>
              : session.done ? <div className="sf-done" role="status"><Icon name="checkCircle" />{tr('Logged today')}</div> : null}
          {!S.active && !session.done && session.alt.map(r => (
            <button key={r.id} type="button" className="btn tinted sf-alt" onClick={() => start([r.id])}>{tr('Or: {0}', r.name)}</button>
          ))}
        </section>

        <section className="sf-tiles" aria-label={tr('Today in numbers')}>
          <Tile icon="steps" tint="var(--green)" label={tr('Steps')} value={steps != null ? fmtNum(steps) : null}
            progress={progressOf(steps, targets.steps)} foot={steps != null ? tr('of {0}', fmtNum(targets.steps)) : noWatch}
            onClick={() => setEditSteps(v => !v)} ariaLabel={tr('Steps') + ': ' + (steps != null ? fmtNum(steps) : tr('no data')) + ', ' + tr('target {0}', fmtNum(targets.steps)) + '. ' + tr('Change target')} />
          <Tile icon="flame" tint="var(--orange)" label={tr('Active kcal')} value={kcal != null ? fmtNum(kcal) : null} foot={kcal != null ? tr('burned') : tr('Watch sync comes next')} />
          <Tile icon="bed" tint="var(--indigo)" label={tr('Sleep')} value={sleep != null ? fmtNum(sleep) : null} unit="h" foot={sleep != null ? tr('last night') : noWatch} />
          <Tile icon="checkCircle" tint="var(--acc)" label={tr('Diet')} value={String(score)} unit="/6" progress={score / 6} foot={score === 6 ? tr('All ticked') : tr('ticked today')} />
        </section>

        {editSteps && (
          <section className="card sf-target" aria-label={tr('Step target')}>
            <div className="sf-target-row">
              <span>{tr('Step target')}</span>
              <Stepper value={targets.steps} step={500} min={500} max={50000} decimal={false} ariaLabel={tr('Step target')}
                onChange={v => setTargets(saveTargets({ ...targets, steps: v }))} />
            </div>
            {suggested && suggested !== targets.steps && (
              <button type="button" className="btn ghost sf-suggest" onClick={() => setTargets(saveTargets({ ...targets, steps: suggested }))}>
                {tr('Use your rule: baseline + 1,500 = {0}', fmtNum(suggested))}
              </button>
            )}
          </section>
        )}

        <section className="sf-check card" aria-labelledby="sf-check-title">
          <h2 id="sf-check-title" className="sf-check-title">{tr('Diet checklist')}<span>{score}/6</span></h2>
          <ul>
            {DIET_ITEMS.map(({ key, label }) => (
              <li key={key}>
                <button type="button" role="checkbox" aria-checked={day[key]} className={'sf-row' + (day[key] ? ' on' : '')}
                  onClick={() => setDiet(toggleDietItem(iso, key))}>
                  <span className="sf-box" aria-hidden="true"><Icon name="check" /></span>
                  <span className="sf-row-lbl">{tr(label)}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
