# PRD: Personal Fitness Tracker (openGym fork)

Nov 26, 2026 · @sachin

> Repo copy. The uploaded original is unchanged. Changed here on 26 Nov 2026: F9 is now "diet checklist plus calorie tracking" (feature table, data records, Phase 4, master prompt), and F11 moves to a last phase and stays locked until a weigh-in of 99 kg or less.

## Summary

Fork openGym, keep its gym engine and animated exercise library, and add four things it lacks for you: a daily activity dashboard fed by the Samsung watch, a preloaded Monday-to-Saturday plan, a simple diet checklist, and a weekly review. The working name is **SachinFit**; it is a personal, non-commercial app for one user.

| Decision | Choice | Source |
| --- | --- | --- |
| Platform | Android app plus web dashboard | Your answer |
| Build path | Fork [openGym](https://github.com/DuarteSantos8/openGym) | Your answer |
| Audience | Only you | Your answer |
| Weekly structure | 4 gym days and 2 light days | Your answer |
| Stack | React 19, Vite, Zustand, Capacitor (Android), Node API, Docker | Inherited from openGym |
| Watch data | Samsung Health to Health Connect to the app | Recommended |
| Exercise animations | openGym's bundled library of over 5,600 exercises | Recommended, see Problems |
| Diet tracking | Daily checklist plus calorie tracking: meal log, saved meals, daily totals | Your answer (26 Nov) |

## Problems and risks

The biggest risk is building an app instead of training. openGym already works today, so install it and start the plan in week 1 while the custom features are built.

| Problem | Impact | Mitigation |
| --- | --- | --- |
| Building becomes a way to avoid the gym | Weeks pass with no training | Phase 0 is install and train. No custom code is needed to start. |
| The exercises-dataset repo is redundant | Double work and duplicate media | openGym already ships animated demos from the same source (Gym visual). Use the dataset only as a lookup for missing exercises. |
| Exercise media licence | Gym visual owns the animations | openGym's notice allows a non-commercial fork to keep them unmodified with the notice. Keep `NOTICE.md` intact and do not publish the app commercially. |
| AGPL-3.0 | A modified version run as a network service must offer its source | Keep the fork in a public GitHub repo, or keep the server on your own network only. |
| openGym is large (about 22,800 files) and moves fast | An AI agent can break things, and upstream merges get painful | Add features as new files and views, touch core files as little as possible, run the existing tests before every commit. |
| Samsung Health must share data with Health Connect | No steps or calories arrive | One-time setup on the phone: Samsung Health, Settings, Health Connect, allow steps, exercise, sleep, heart rate, weight. |
| Steps and daily calories may not be shown yet | The headline feature is missing | The Android manifest already requests `READ_STEPS`, `READ_SLEEP` and `READ_EXERCISE`. The agent must first check what `frontend/src/lib/health-read.js` actually reads. |
| HealthifyMe scale weight may not reach Health Connect | The 99 kg unlock never sees a weigh-in | openGym already reads weight from Health Connect. HealthifyMe is a Health Connect partner, but published lists show it writing food and steps, not weight. Check once on the phone (Health Connect, Data and access, Weight: is HealthifyMe listed?). If not, log the weigh-in in SachinFit (about 5 seconds) or in Samsung Health. |
| Calorie tracking becomes a chore | Logging stops after a week | Saved meals log in one tap; foods are entered once. openNutrition (openGym's sister app, docs/dev/SISTER_APPS.md) was checked: openGym can already read its daily totals, but it is in private beta, needs its own server, and the meal logging would happen in a second app. Hand-entered foods in SachinFit are less work now; the openNutrition link stays an option later. |
| Too many numbers on screen | You stop opening the app | The home screen shows four numbers and one checklist, nothing else. |

## Goals and success metrics

The product goal is that opening the app each day takes under 10 seconds to answer one question: what do I do today, and did I do it.

| Goal | Metric | Target |
| --- | --- | --- |
| Lose weight steadily | Weekly average weight | 110 kg to 99 kg in 10 to 20 weeks |
| Train consistently | Planned sessions completed per week | 4 of 4 gym, 2 of 2 light |
| Move daily | Steps from the watch | Baseline plus 1,500 to 2,000, rising towards 8,000 |
| Eat to plan | Daily checklist items ticked | 5 of 6 on at least 6 days a week |
| Stay engaged | Days the app is opened | 6 of 7 |

**Non-goals for version 1:** barcode or photo food logging, a built-in food database, social features, an AI coach, Wear OS watch app changes, iPhone, any public or commercial release.

**User:** one person, 26, Samsung phone and Galaxy Watch, SLAM gym with pool access, gets bored fast, wants strict and simple. Medical conditions mean the training plan must be confirmed with his rheumatologist and no feature may give medical advice.

## Features

Most of the gym side already exists in openGym; the build work is the five rows marked New.

| # | Feature | Status | What it does |
| --- | --- | --- | --- |
| F1 | Exercise library with animations | Exists | Search by muscle or equipment; every exercise shows its animated demo and steps. |
| F2 | Weekday routines and guided sessions | Exists | Pre-filled weights, rest timer, PR detection, supersets, progression rules. |
| F3 | Progress | Exists | Estimated 1RM, muscle map, body-weight chart, progress photos. |
| F4 | Health Connect link | Exists, partial | Writes workouts; reads heart rate and weigh-ins. Steps to be confirmed. |
| F5 | Web dashboard | Exists | The self-hosted web app is the dashboard; same data as the phone. |
| F6 | Today screen | New | One screen: today's session, steps vs target, active calories, sleep hours, diet checklist. |
| F7 | Daily activity sync | New | Reads steps, active and total calories, sleep and watch-recorded exercise from Health Connect, stored per day. |
| F8 | Preloaded weekly plan | New | The Monday-to-Saturday template below, shipped as a routine file and loaded on first run. |
| F9 | Diet checklist plus calorie tracking | New | Six daily ticks (protein at each meal, vegetables twice, no sugary drinks, dinner protein, water, no stored snacks) plus a meal log: breakfast, lunch, dinner, snack, each entry with food name, grams or servings, kcal, protein, carbs, fat. Saved meals (omelette breakfast, chicken and corn lunch, Amul shake) logged with one tap. Daily totals against your targets (2,000 to 2,100 kcal, 150 to 165 g protein) shown on Today as eaten, burned and remaining. Foods are your own, entered by hand. No barcode scanning or photo recognition. |
| F10 | Weekly review | New | Sunday summary: average weight, sessions done, average steps, checklist score, average daily kcal and protein, streak, one line on what to change. |
| F11 | Activity frequency | New, locked | Calendar heatmap of gym, pool, walk and rest days, with weekly counts. Built last. Shown as a locked card until the first weigh-in at or below 99 kg (the goal weight), then unlocks by itself and stays unlocked. |

**Ideas taken from the other repos**

| Repo | Idea adopted | Where |
| --- | --- | --- |
| [GymMane](https://github.com/InlitX/GymMane) | Streaks, levels and medals | F6 and F10 |
| [workout-tracker](https://github.com/jovandeginste/workout-tracker) | Daily weight and step stats, calendar view | F7 and F11 |
| [exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset) | Schema reference and fallback lookup for missing exercises | F1 |
| [exercisedb-api](https://github.com/ExerciseDB/exercisedb-api) | Not used in version 1; paid plans and rate limits | None |

## Architecture and data

Nothing new is added to the stack; watch data reaches the app through Health Connect in a straight line.

1. Galaxy Watch records steps, calories, sleep, heart rate and workouts.
2. Samsung Health on the phone receives them and shares them with Health Connect.
3. The Android app (Capacitor shell in `frontend/android`) reads Health Connect on open and once a day.
4. The React app stores a daily record on the device and shows the Today screen.
5. Multi-device sync sends it to the self-hosted Node API, which stores JSON in `./data`.
6. The web app served by nginx shows the same data on a large screen.

| Layer | Technology | Location in the repo |
| --- | --- | --- |
| App UI | React 19, Vite, Zustand | `frontend/src/views`, `components`, `store`, `lib` |
| Android shell | Capacitor, Kotlin | `frontend/android` |
| Health link | Health Connect | `frontend/src/lib/health-read.js`, `health-sync.js` |
| API | Node.js, plain `node:http` | `api/server.js` and modules beside it |
| Exercise data | JSON per exercise plus 180 px media | `catalogue/exercises`, `catalogue/media` |
| Routines | JSON files | `routines/` |
| Hosting | Docker Compose, two containers | `docker-compose.yml` |

**New data records**

| Record | Fields |
| --- | --- |
| `dailyActivity` | date, steps, stepTarget, activeKcal, totalKcal, sleepMinutes, restingHr, source |
| `dietCheck` | date, six booleans, note |
| `food` | id, name, unit (g or serving), grams per serving, kcal, protein, carbs, fat (per 100 g or per serving) |
| `savedMeal` | id, name, slot (breakfast, lunch, dinner, snack), items [{ foodId, amount }] |
| `mealLog` | date, slot, items [{ foodId or name, amount, kcal, protein, carbs, fat }] |
| `nutritionTargets` | kcalMin, kcalMax, proteinMin, proteinMax |
| `activityLog` | date, type (gym, pool, walk, rest), minutes, source (app or watch) |
| `weeklyReview` | weekStart, avgWeight, sessionsDone, avgSteps, checklistScore, avgKcal, avgProtein, streak, note |

**Framework options considered**

| Option | For | Against | Verdict |
| --- | --- | --- | --- |
| Fork openGym (React and Capacitor) | Gym engine, animations, Health Connect and web dashboard already built | AGPL, large codebase | Chosen |
| Flutter from scratch, GymMane style | Clean native app, offline | Everything rebuilt, no web dashboard, no health link | Rejected |
| Go and SQLite web app, workout-tracker style | Simple server, good charts | No Health Connect, so no watch data | Rejected |
| React Native from scratch | Good health libraries | Months of work to match openGym | Rejected |

## Weekly plan template

Four machine-based gym sessions of about 40 minutes and two light days, with Sunday off. Confirm the exercise choices with your rheumatologist before loading the spine, and skip the pool when skin lesions are open.

| Day | Session | Minutes | Daily extras |
| --- | --- | --- | --- |
| Monday | Upper A: chest and back | 40 | Step target |
| Tuesday | Lower A: legs | 40 | Step target |
| Wednesday | Light: pool walking in the shallow end | 20 to 30 | Step target |
| Thursday | Upper B: shoulders and arms | 40 | Step target |
| Friday | Lower B: legs and core | 40 | Step target |
| Saturday | Light: long walk or easy full-body circuit | 30 to 45 | Weekly weigh-in average |
| Sunday | Rest | 0 | Weekly review, batch cooking |

**Exercises: 3 sets of 10 to 12, 60 to 90 seconds rest, add weight when all sets reach 12**

| Upper A | Lower A | Upper B | Lower B |
| --- | --- | --- | --- |
| Machine chest press | Leg press | Machine shoulder press | Leg press, feet high |
| Lat pulldown | Leg curl | Seated cable row, wide grip | Leg extension |
| Seated cable row | Leg extension | Cable lateral raise | Seated leg curl |
| Incline machine press | Seated calf raise | Cable triceps pushdown | Hip abduction machine |
| Face pull | Hip adduction machine | Dumbbell or cable biceps curl | Cable Pallof press |
| 5 minutes easy cycle | 5 minutes easy cycle | 5 minutes easy cycle | Dead bug, 2 sets |

**Saturday circuit option, 2 rounds, light weights:** chest press, lat pulldown, leg press, shoulder press, seated row, 10 minutes incline walk.

Machines are chosen over barbells to keep skin friction and spine loading low. Each exercise maps to an entry in the openGym library, so its animation shows during the session.

## Build phases

Six phases, each ending in something you can use; Phase 0 needs no code.

| Phase | Scope | Done when |
| --- | --- | --- |
| 0. Use it now | Install the openGym Android APK, connect Health Connect, enter the weekly plan by hand | You log Monday's session in the app with animations showing |
| 1. Fork and run | Fork the repo, run `docker compose up`, build the Android app from `frontend/android`, confirm all tests pass | Your own build runs on your phone and the web dashboard opens in a browser |
| 2. Plan and Today screen | F8 preloaded plan, F6 Today screen with today's session | Opening the app shows today's session in one tap |
| 3. Watch data | F7 daily activity sync, plus weigh-ins from Health Connect (HealthifyMe scale, see below) | Yesterday's steps and calories match Samsung Health within 2%, and the latest weigh-in shows in the app |
| 4. Diet and review | F9 diet checklist plus calorie tracking (meal log, saved meals, eaten / burned / remaining on Today), F10 weekly review with average kcal and protein, streaks | A saved meal logs in one tap, Today shows eaten, burned and remaining, and the Sunday review appears with every number filled |
| 5. Goal unlock | F11 activity frequency, locked until a weigh-in at or below 99 kg | The heatmap card shows locked above 99 kg and unlocks by itself on the first weigh-in at 99 kg or less |

**Acceptance rules for every phase**

- Existing frontend, API and MCP test suites still pass.
- New logic has its own tests beside the file, following the repo's pattern.
- New screens work offline on the phone and sync when the server is reachable.
- `LICENSE` and `NOTICE.md` stay unmodified, and exercise media are not altered.
- No new third-party service, account, analytics or tracking.

## Master prompt

Paste this into Claude Code (or another coding agent) opened inside your fork of openGym, and attach this PRD.

```text
You are working in my personal, non-commercial fork of openGym
(https://github.com/DuarteSantos8/openGym). Read CLAUDE.md,
docs/ARCHITECTURE.md, docs/INTEGRATIONS.md, docs/MOBILE.md and NOTICE.md
before writing any code, then follow the attached PRD.

GOAL
Turn openGym into a single-user daily fitness tracker for me. Keep the
existing gym engine, exercise library and animations. Add:
  F6  Today screen: today's session, steps vs target, active calories,
      sleep hours, diet checklist. Four numbers and one checklist only.
  F7  Daily activity sync from Health Connect (my Samsung Galaxy Watch
      writes to Samsung Health, which shares with Health Connect): steps,
      active and total calories, sleep, watch-recorded exercise sessions.
  F8  A preloaded Monday-to-Saturday routine (4 gym days, 2 light days)
      exactly as listed in the PRD, loaded on first run.
  F9  Diet checklist plus calorie tracking: six daily booleans; a meal
      log (breakfast, lunch, dinner, snack; food, grams or servings,
      kcal, protein, carbs, fat); saved meals logged in one tap; daily
      totals vs my targets shown on Today as eaten, burned, remaining.
      My own foods entered by hand. No barcode or photo recognition.
  F10 Weekly review every Sunday: average weight, sessions done, average
      steps, checklist score, average kcal and protein, streak.
  F11 Activity frequency: calendar heatmap of gym, pool, walk, rest days.
      Built last; locked until a weigh-in at or below 99 kg, then
      unlocks by itself.

RULES
1. Work one PRD phase at a time. Stop after each phase, show me what
   changed and how to test it on my phone, and wait for my go-ahead.
2. Before F7, read frontend/src/lib/health-read.js and health-sync.js and
   the Android manifest, and tell me which Health Connect record types are
   already read. Reuse what exists. Add permissions only if missing.
3. Add features as new files and views. Change existing core files as
   little as possible so I can keep merging upstream.
4. Follow the repo's existing patterns: React 19, Zustand store,
   localisation files, tests beside the source file.
5. Run the frontend, api and mcp test suites and the CI checks listed in
   CLAUDE.md before every commit. Do not delete or weaken tests.
6. Every new screen must work offline on the phone and sync through the
   existing sync path. Store new records using the PRD's data model:
   dailyActivity, dietCheck, activityLog, weeklyReview.
7. Map each exercise in the weekly plan to an existing catalogue entry by
   id so its animation shows. If one is missing, list it and ask me; you
   may look it up in https://github.com/hasaneyldrm/exercises-dataset for
   naming only. Do not copy media from other repos.
8. Licence: keep LICENSE and NOTICE.md unmodified, do not alter the
   exercise media, keep the code AGPL-3.0-or-later.
9. No new third-party services, accounts, analytics or telemetry. No AI
   coach, social features, barcode scanning or iOS work.
10. The app must not give medical or dietary advice. Targets are numbers I
    set in Settings: step target, calorie target, protein target.
11. Ask me before any destructive action: deleting data, rewriting git
    history, or changing the sync format.

FIRST TASK
Do not write code yet. Reply with: (a) a one-page summary of how openGym
is structured, (b) which of F6 to F11 are already partly supported and
where, (c) your file-by-file plan for Phase 1 and Phase 2, and (d) any
questions that block you.
```

## Open questions

- [ ] Which Galaxy Watch model and phone do you use, and is Samsung Health already sharing with Health Connect?
- [ ] Where will the web dashboard run: your laptop, a home machine, or a small cloud server?
- [ ] What is your current average daily step count, so the first target can be set?
- [ ] Has your rheumatologist cleared machine-based strength training and pool walking?
- [ ] Diet tracking depth: is the six-tick checklist enough, or do you want calories and protein logged per meal?
- [ ] Preferred gym time and session length, so reminders fire at the right hour?
- [ ] Do you want Tamil as well as English in the app?

## Sources

- [openGym](https://github.com/DuarteSantos8/openGym): README, CLAUDE.md, docs/INTEGRATIONS.md and the Android manifest, read from a clone on 26 Nov 2026
- [exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset)
- [GymMane](https://github.com/InlitX/GymMane)
- [workout-tracker](https://github.com/jovandeginste/workout-tracker)
- [exercisedb-api](https://github.com/ExerciseDB/exercisedb-api)
