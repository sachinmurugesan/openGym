# SachinFit: running it and testing each phase

## Phase 1: fork and run

### Web dashboard on your computer (Docker)

```sh
git clone https://github.com/sachinmurugesan/openGym.git && cd openGym
cp .env.example .env            # RP_ID=localhost, ORIGIN=http://localhost:8080
docker compose up -d --build    # builds api + web from this fork
# open http://localhost:8080
```

Without Docker (what the cloud check used):

```sh
cd api && npm ci && DATA_DIR=../data PORT=3000 RP_ID=localhost ORIGIN=http://localhost:5173 node server.js
cd frontend && npm ci && npm run dev      # http://localhost:5173, proxies /api to :3000
```

### Tests (Node 22)

```sh
cd frontend && npm test
cd api && npm test
cd mcp && npm test
cd frontend && node scripts/check-locales.mjs && node scripts/check-source-strings.mjs --strict
node scripts/catalogue/build.mjs --check && node scripts/build-coach-assets.mjs --check && node scripts/build-api-docs.mjs --check
```

### Android app on your Samsung phone

One time: install Android Studio (it brings the SDK) and Java 21. On the phone: Settings, About
phone, Software information, tap Build number 7 times; then Developer options, USB debugging on.

```sh
cd frontend
npm ci
npm run build:mobile                       # web build + 180 px media + cap sync into android/
cd android
./gradlew assembleSideloadDebug            # Windows: gradlew.bat assembleSideloadDebug
adb install -r app/build/outputs/apk/sideload/debug/app-sideload-debug.apk
```

The debug build's app id ends in `.test`, so it installs next to the official openGym APK
instead of clashing with it, and needs no keystore. It is labelled as the test build on the home
screen. Ignore any "new version" prompt from the built-in updater: it points at upstream openGym.
Alternatively `npx cap open android` and press Run in Android Studio with the phone plugged in.

Health Connect, one time: Samsung Health, Settings, Health Connect, allow steps, exercise, sleep,
heart rate, weight. Then in SachinFit: Settings, Integrations, Health Connect, turn on the reads
(vitals for steps and sleep).

## Phase 2: weekly plan (F8) and Today (F6)

| Check | How | Expected |
| --- | --- | --- |
| Plan loads on first run | Open the app after installing | Plan tab: Mon Upper A, Tue Lower A, Wed Pool walking, Thu Upper B, Fri Lower B, Sat Long walk, Sun empty |
| Opens on Today | Close and reopen the app | Today screen, today's session at the top |
| One tap to train | Tap Start on the session card (or the middle tab) | Workout opens on the first exercise with its animation, "Plan: 3 x 10-12", Double progression |
| Saturday option | On a Saturday | "Or: Light circuit" under Start |
| Sunday | On a Sunday | "Rest day, Weekly review and batch cooking", no Start |
| Done state | Finish today's session, go back to Today | "Logged today" |
| Steps and sleep | With Health Connect vitals on, after the watch syncs | Steps with a bar against your target, sleep hours |
| Step target | Tap the Steps tile | A stepper; with 3+ days of steps, a button with your rule (baseline + 1,500, max 8,000) |
| Checklist | Tap each row | Tick toggles, Diet tile counts n/6, survives closing the app |
| Full Home | Top-right grid button | openGym's Home with settings and body weight |

Known limits in Phase 2: diet ticks and targets live on the device only (synced in Phase 4, after
the sync-format change is agreed); active calories show once Phase 3 reads them.
