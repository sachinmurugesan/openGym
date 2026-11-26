# SachinFit design system (new screens only)

SachinFit is a personal, non-commercial fork of openGym. This page covers the screens SachinFit
adds (Today now; the diet log, weekly review and activity heatmap later). Existing openGym
screens keep their own look and are not restyled.

How it was made: the `ui-ux-pro-max` skill generated a design system for "fitness tracker, dark,
mobile dashboard" (`--design-system`, density 6), and the `bencium-controlled-ux-designer` skill
supplied the accessibility and production UX rules. Where the generator disagreed with openGym or
with the project rules, openGym and the rules win; every such override is listed below.

## 1. Layout pattern

| Decision | Choice | Why |
| --- | --- | --- |
| Pattern | One task card, then a 2 x 2 number grid, then one checklist | PRD: "four numbers and one checklist, nothing else" |
| Primary action | One full-width Start button inside the session card, 56 px tall | One tap from opening the app to a running session |
| Thumb reach | Start sits in the lower half of the first screen; the tab bar's own Start also starts today's plan | One-thumb use on a 6.1 to 6.7 inch phone |
| Mobile widths | Designed at 360, 390 and 412 px, one column, 16 px side padding (`--pad`) | Samsung phones; no horizontal scroll |
| Web dashboard (1000 px and up) | Two columns: session and four numbers on the left (numbers four across), checklist on the right; max 1,040 px | The same data as the phone on a large screen |
| Navigation | The Home tab opens Today; Today's top-right button opens openGym's full Home (settings, weight card, week strip) | Bottom bar stays at five items |

## 2. Colours

All colours are openGym's existing CSS variables (`frontend/src/index.css :root`). No new hex
values. Dark is the default theme (`DEF.theme = 'dark'`), and the light theme works automatically
because every value is a variable.

| Role | Token | Used for |
| --- | --- | --- |
| Page | `--bg` | Background |
| Card | `--surface` | Session card, number tiles, checklist |
| Pressed | `--press-fill`, `--surface-2` | Row and tile press states |
| Track | `--surface-3` | Progress bar track |
| Text | `--label`, `--label-2`, `--label-dim` | Primary, secondary, footnotes (4.5:1 or better on `--surface`) |
| Primary action | `--acc` with `--on-acc` | Start button, ticked boxes |
| Accent text | `--acc-ink` | "Gym day" kicker, focus ring |
| Steps | `--green` | Icon and progress bar |
| Active kcal | `--orange` | Icon |
| Sleep | `--indigo` | Icon |
| Done | `--green` | "Logged today" |

The generator proposed an orange (#F97316) and green palette on slate. It was not used: the rules
say reuse openGym's tokens, and openGym's accent is per-account (Settings, Look), so Sachin can
switch the accent to orange there without any code.

## 3. Typography

openGym's system font stack and its rem type scale (`--fs-*`), unchanged.

| Element | Token | Weight |
| --- | --- | --- |
| Page title "Today" | `--fs-large` (34 px, 30 px on narrow phones) | 700 |
| Session name | `--fs-title2` (22 px) | 700 |
| Numbers | 2 rem, tabular figures | 700 |
| Checklist rows | `--fs-body` (17 px) | 400 |
| Labels, footnotes | `--fs-footnote`, `--fs-caption` | 600 / 400 |

The generator proposed Barlow and Barlow Condensed from Google Fonts. Not used: it would be a new
third-party request on every start (PRD: no new third-party services) and would not match the
rest of the app.

## 4. Spacing, shape, motion

- Spacing: 4 px base; 10 to 16 px gaps; 16 px card padding (`--pad`).
- Radii: `--r-card` (14 px) for tiles and cards, `--r` (12 px) for buttons.
- Motion: openGym's `--fast` (140 ms) presses and `--med` (220 ms) bar fills on `--ease`; only
  `transform`, `opacity` and colours animate. `prefers-reduced-motion` turns them off.

## 5. Accessibility and production UX rules (bencium-controlled-ux-designer)

| Rule | How Today meets it |
| --- | --- |
| Touch targets 44 px (iOS) / 48 dp (Android) | Start 56 px, checklist rows 56 px, alternative and target buttons 48 px, tiles 100 px |
| 8 px or more between targets | Tile gap 10 px, rows separated by full-width hairlines |
| Contrast 4.5:1 for text | Only openGym label tokens, already audited (index.css comments, design review 1.4.5) |
| Do not rely on colour alone | Ticked rows show a check mark and dim the label; numbers carry a text footnote |
| Semantic roles | Session and checklist are `section`s with headings; each checklist row is a `button role="checkbox"` with `aria-checked`; the steps tile has a full `aria-label` |
| Visible focus | `:focus-visible` outline in `--acc-ink` on rows and the tappable tile |
| Immediate feedback | Press state within 140 ms on every target; ticks save instantly |
| Empty states say why | "Shows on your phone" on the web, "Turn on Health Connect vitals" on the phone, "Watch sync comes next" for calories until Phase 3 |
| No medical or dietary advice | Copy states facts and your own targets only; the step suggestion is your own rule ("baseline + 1,500") and is only applied when you tap it |
| Forgiveness | A tick is undone with another tap; nothing is deleted |

## 6. Anti-patterns to avoid

- More than four numbers or a second list on Today.
- New colours, fonts, shadows or gradients outside the openGym tokens.
- Emoji as icons (use `components/Icon.jsx`).
- Hover-only affordances (phones have no hover).
- Tiny tap targets beside each other (the generator's checklist: 44 px minimum, 8 px apart).
- Animating width or height (the progress bar animates `transform: scaleX`).
- Copy that reads as advice ("you should eat...", "too little sleep").
- Restyling openGym screens to match SachinFit.

## 7. Checking a new screen

1. `npx vitest run src/sachinfit` and the full suites (see CLAUDE.md).
2. Browser check with the `webapp-testing` skill (Playwright): 360, 390 and 412 px wide and
   1280 px, dark theme, screenshots of each state (gym day, light day with alternative, rest day,
   edited target).
3. On the phone: one-thumb pass through every target, TalkBack reads each row as a checkbox with
   its state.
