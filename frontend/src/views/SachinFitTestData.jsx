// SachinFit test data page (dev builds only, App.jsx): put two weeks of test data on this
// profile, or take it off again. The data and its marks live in src/sachinfit/test-data.js.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore.js'
import { t } from '../lib/i18n.js'
import { seedTestData, seedTestDiet, wipeTestData, wipeTestDiet, hasTestData, SEED_DAYS } from '../sachinfit/test-data.js'
import './Today.css'

const tr = (s, ...args) => t(s, ...args)

export default function SachinFitTestData() {
  const nav = useNavigate()
  const S = useStore(s => s.S)
  const update = useStore(s => s.update)
  const [msg, setMsg] = useState('')
  const on = hasTestData(S)

  const seed = () => {
    let r = { workouts: 0, weighIns: 0 }
    update(s => { r = seedTestData(s) })
    const d = seedTestDiet()
    setMsg(tr('Added {0} workouts, {1} weigh-ins and {2} diet days.', String(r.workouts), String(r.weighIns), String(d.length)))
  }
  const wipe = () => {
    let r = { workouts: 0, weighIns: 0 }
    update(s => { r = wipeTestData(s) })
    const d = wipeTestDiet()
    setMsg(tr('Removed {0} workouts, {1} weigh-ins and {2} diet days.', String(r.workouts), String(r.weighIns), String(d)))
  }

  return (
    <div className="sf-today">
      <header className="hdr sf-hdr"><div><div className="sub">{tr('Dev build only')}</div><h1>{tr('Test data')}</h1></div></header>
      <div className="sf-grid">
        <section className="card sf-session">
          <div className="sf-kicker">{on ? tr('Test data is on') : tr('No test data')}</div>
          <p className="sf-session-sub">{tr('The last {0} days of the weekly plan as logged workouts (one Thursday missed), morning weigh-ins from about 110 kg trending down, and diet ticks. Today is left empty so you can try it yourself. Each workout carries the note "SachinFit test data"; Remove takes out only what was added here.', String(SEED_DAYS))}</p>
          <button type="button" className="btn primary sf-go" onClick={seed}>{tr('Add test data')}</button>
          <button type="button" className="btn tinted sf-alt" onClick={wipe} disabled={!on}>{tr('Remove test data')}</button>
          <button type="button" className="btn ghost sf-alt" onClick={() => nav('/today')}>{tr('Go to Today')}</button>
          {msg && <p className="sf-session-sub" role="status">{msg}</p>}
        </section>
      </div>
    </div>
  )
}
