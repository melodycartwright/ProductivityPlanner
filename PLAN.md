# Productivity Planner App — Build Plan

A PWA that mirrors ["The Productivity Planner" by Intelligent Change](https://www.amazon.se/dp/B08Q7GTZ14) —
a small black Pomodoro-based paper planner — with real alarms, ADHD/neurodivergent-friendly
UX, and encouraging copy. Built to be portfolio-quality and to teach real fundamentals, not
hide behind an agent — each phase below is a self-contained unit you can hand to a Copilot
coding agent one at a time, review, and understand before moving to the next.

## How to use this document

Work through the phases **in order**. For each phase:
1. Read the "Concept" note first — that's the thing to actually understand, not skip.
2. Paste the "Agent prompt" into Copilot (Workspace, or Chat in agent mode) in this repo.
3. Check the agent's output against "Acceptance criteria" yourself before moving on.
4. Commit with a message describing the phase (e.g. `feat: pomodoro timer reducer + tests`).

Don't let an agent jump ahead to a later phase's prompt before the current one is merged —
each phase depends on the last.

## Non-negotiable constraints (put these in every agent prompt as context)

- **Stack**: React 19 + TypeScript + Vite (not Next.js — no server needed, this is a
  client-only PWA). Tailwind CSS v4 (CSS-first `@theme` config, no `tailwind.config.js`).
  `oxlint` for linting, Prettier for formatting, Vitest + React Testing Library for tests.
- **No deprecated APIs.** No `create-react-app`. No class components. No `moment.js` (use
  native `Date`/`Intl` or `date-fns` if truly needed). No Tailwind v3 config style.
- **Architecture**: feature-folder structure (below), not "one giant components folder."
- **No backend, no auth, no database.** Everything is local-first (`localStorage`) through
  the whole plan. This is a deliberate simplicity constraint, not an oversight.
- **Simplicity over abstraction.** No premature config layers, no state-management library
  (Redux/Zustand) — `useReducer` + Context is enough for this app's size, and is more
  valuable to understand deeply than a library that hides the mechanism.

---

## Architecture

```
src/
  app/
    App.tsx                 # top-level composition/layout only
  features/
    timer/
      timerReducer.ts        # pure state machine, no React
      timerReducer.test.ts
      usePomodoroTimer.ts     # React hook wrapping the reducer + interval
      TimerDisplay.tsx
      TimerControls.tsx
    planner/
      TopPriorities.tsx
      TimeBlockList.tsx
      PomodoroTally.tsx
      EveningReflection.tsx
    motivation/
      messages.ts             # data: encouraging copy pools
      useMotivationalMessage.ts
  shared/
    components/               # generic reusable UI (Button, Card, ProgressRing...)
    hooks/
    lib/
      storage.ts               # typed localStorage wrapper
      notifications.ts          # Notification permission + dispatch
      sound.ts                  # Web Audio alarm tones
    types/
  main.tsx
  index.css                    # Tailwind import + @theme design tokens
```

**Concept — why feature folders?** Grouping by *feature* (`timer/`, `planner/`) instead of
by *file type* (`components/`, `hooks/`, `reducers/` each holding everything) means
everything related to one concern lives together. When you're done with the timer feature,
you never have to hunt across four top-level folders to find its pieces. `shared/` is only
for things genuinely used by 2+ features.

---

## Design direction (Phase 2 will implement this)

The physical planner: black linen hardcover, cream/off-white pages, gold foil lettering and
elastic band, a tomato-red accent used for the Pomodoro icon. Translate that into design
tokens (CSS custom properties via Tailwind's `@theme`), not hardcoded hex codes scattered
through components:

- `--color-cover` — near-black background for chrome/header (`#100e0c`)
- `--color-paper` — warm cream for content surfaces (`#f6f1e7`)
- `--color-ink` — near-black text on paper (`#17140f`)
- `--color-gold` — accent for dividers/highlights (`#c9a24b`)
- `--color-tomato` / `--color-tomato-dark` — Pomodoro/focus accent (`#d94f30` / `#a53a22`)

---

## Phase 0 — Project scaffold

**Concept:** Vite gives you a real `index.html` entry point and fast dev server without the
complexity of Next.js's file-based routing/server, which this app doesn't need since it's a
single-page client app with no server-rendered routes.

**Agent prompt:**
> Scaffold a new Vite + React 19 + TypeScript project in this repo root using
> `npm create vite@latest . -- --template react-ts`. Remove all demo boilerplate (counter,
> logos, demo CSS). Add Tailwind CSS v4 via `@tailwindcss/vite` (CSS-first, no
> `tailwind.config.js`). Add a `@/` → `src/` path alias in `vite.config.ts` and
> `tsconfig.app.json`. Create the empty feature-folder structure from PLAN.md's Architecture
> section. Add `oxlint` (already scaffolded by Vite) and `prettier` as dev dependencies.
> Verify `npm run dev`, `npm run build`, and `npm run lint` all succeed before finishing.

**Acceptance criteria:**
- [ ] `npm run dev` boots a blank/minimal page with no console errors
- [ ] `npm run build` and `npm run lint` pass clean
- [ ] Folder structure matches the Architecture section
- [ ] No leftover Vite demo assets (react.svg, counter button, etc.)

---

## Phase 1 — Core Pomodoro engine (pure logic, no UI)

**Concept:** Model the timer as a **finite state machine**: at any moment it's in exactly one
of a few states (`idle`, `focus`, `shortBreak`, `longBreak`, `paused`), and only specific
transitions are legal (you can't go from `idle` straight to `longBreak`). A `useReducer`
reducer is a pure function `(state, action) => newState` — writing the whole machine as one
pure function (no React, no DOM) makes it trivially unit-testable and is *why* we build this
before any UI exists.

Also critical: **timer drift.** A naive `setInterval(() => setSeconds(s => s - 1), 1000)`
drifts because `setInterval` isn't guaranteed to fire exactly every 1000ms (tab throttling,
event loop delays). The fix: store an absolute `endTimestamp` (via `Date.now()`) when a
phase starts, and on every tick compute `remaining = endTimestamp - Date.now()` — you're
always deriving from real wall-clock time, not accumulating small errors.

**Agent prompt:**
> In `src/features/timer/`, implement `timerReducer.ts` as a pure state machine with states
> `idle | focus | shortBreak | longBreak` (plus an `isPaused` flag and a `completedFocusCount`
> for tracking when a long break is due, e.g. every 4th focus session). Actions: `START`,
> `PAUSE`, `RESUME`, `SKIP`, `RESET`, `TICK`. Use an absolute `endTimestamp` (not a decrementing
> counter) to avoid `setInterval` drift — `TICK` recomputes remaining time from
> `endTimestamp - Date.now()` and auto-transitions phases when it hits zero. Default durations:
> 25min focus, 5min short break, 15min long break (make these configurable constants, not
> magic numbers). Write `timerReducer.test.ts` with Vitest covering every transition,
> pause/resume math, and the auto-transition-on-zero behavior. Then implement
> `usePomodoroTimer.ts`, a hook that wraps the reducer with a `setInterval` driving `TICK`
> every second and cleans up the interval on unmount.

**Acceptance criteria:**
- [ ] `timerReducer.ts` has zero React/DOM imports — it's pure and framework-agnostic
- [ ] Tests cover: focus→shortBreak, focus→longBreak (every 4th), pause math, skip, reset
- [ ] Pausing and resuming after a real delay doesn't lose or gain time (drift test)
- [ ] `npm run test` passes

---

## Phase 2 — Visual shell & timer UI

**Concept:** Big, obvious, single-focus visual state. For ADHD/neurodivergent users,
ambiguity about "how much time is left" or "what happens next" is a real source of anxiety —
so the timer should be readable at a glance (a circular progress ring, not just digits) and
there should never be more than one primary action visible at once.

**Agent prompt:**
> Implement the design tokens from PLAN.md's Design Direction section as Tailwind v4 `@theme`
> variables in `src/index.css`. Build `TimerDisplay.tsx` (large circular SVG progress ring
> showing time remaining + digital MM:SS, color-coded by phase — tomato for focus, gold for
> break) and `TimerControls.tsx` (Start/Pause/Resume as a single primary button that changes
> label by state, plus a secondary Skip and Reset). Wire both to `usePomodoroTimer` from
> Phase 1. Compose them in `App.tsx`. Keep to one primary call-to-action visible at a time —
> no more than 2 buttons on screen during active states.

**Acceptance criteria:**
- [ ] Visually matches the cover/paper/gold/tomato palette, not default Tailwind grays
- [ ] Progress ring animates smoothly and matches the digital countdown
- [ ] Only one primary button at a time; states are visually distinct (focus vs. break)
- [ ] Works on a phone-sized viewport (test at 375px width)

---

## Phase 3 — Alarms & notifications

**Concept:** `Notification.requestPermission()` must be called from a user gesture (a click),
not on page load — browsers block silent permission prompts. Also: a jarring sound can be a
real problem for sensory-sensitive users, so the alarm tone should be a short, gentle Web
Audio tone (a couple of sine-wave beeps) rather than a harsh MP3 alarm clip.

**Agent prompt:**
> In `src/shared/lib/notifications.ts`, implement a `requestNotificationPermission()` function
> triggered from an explicit "Enable alerts" button (not on load), and a `notifyPhaseChange(phase)`
> function using the `Notification` API guarded by a permission check, with a fallback that just
> shows an in-app banner if permission is denied. In `src/shared/lib/sound.ts`, implement a
> gentle two-tone chime using the Web Audio API (`AudioContext`, `OscillatorNode`) — no external
> audio files. Wire both into `usePomodoroTimer`'s phase-transition logic so they fire exactly
> once per transition (focus→break and break→focus).

**Acceptance criteria:**
- [ ] Permission is only requested after a user clicks a button, never automatically
- [ ] Denying permission doesn't break the app — in-app banner still shows
- [ ] Sound fires exactly once per transition, not repeatedly, and isn't harsh/jarring
- [ ] Works with the tab backgrounded (notification still fires)

---

## Phase 4 — Planner features (mirrors the physical book)

**Agent prompt:**
> In `src/features/planner/`, build: `TopPriorities.tsx` (exactly 3 editable text slots —
> constrain to 3 by design, matching the physical planner's "most important tasks" page, not
> an open-ended list), `TimeBlockList.tsx` (simple add/edit/remove time-blocked entries for the
> day), `PomodoroTally.tsx` (per-task checkbox-style tally that increments each time a focus
> session completes while that task is "active"), and `EveningReflection.tsx` (a short
> end-of-day prompt: "What went well today?" / "What will you improve tomorrow?"). Keep forms
> minimal — no required fields, nothing blocks the user from leaving a section blank.

**Acceptance criteria:**
- [ ] Top priorities are hard-capped at 3, not an arbitrary list
- [ ] Pomodoro tally increments automatically tied to Phase 1's `completedFocusCount`
- [ ] Nothing is a required field — the planner never blocks or nags

---

## Phase 5 — ADHD/neurodivergent UX pass & motivational copy

**Concept:** Streaks framed as "you broke your streak" create shame; framed as "you've shown
up 12 times this month" they don't. Write copy accordingly — no punitive language, ever.

**Agent prompt:**
> In `src/features/motivation/messages.ts`, create categorized arrays of short, encouraging
> copy (session-start, session-complete, break-start, missed-a-day-but-back) with a strict
> rule: no guilt/shame language, no exclamation-point-forced positivity, plain and warm tone.
> Implement `useMotivationalMessage(category)` that picks a random non-repeating message.
> Then do a UX pass over Phases 2 and 4: ensure touch targets are ≥44px, remove any
> multi-step confirmation dialogs for reversible actions, and ensure color is never the only
> signal (pair every color-coded state with text or an icon, for colorblind users).

**Acceptance criteria:**
- [ ] No message in the copy pool uses guilt/shame framing (manually review the list)
- [ ] Same message doesn't repeat twice in a row
- [ ] All interactive elements are ≥44px touch targets
- [ ] Every color-coded state also has a text/icon signal

---

## Phase 6 — Persistence

**Concept:** Reach for `localStorage` before a database — it needs no auth, no network, no
backend to stand up, and is the correct default until multi-device sync is an actual
requirement (it isn't, for this app).

**Agent prompt:**
> In `src/shared/lib/storage.ts`, build a small typed wrapper: `getItem<T>(key, fallback)` /
> `setItem<T>(key, value)` that JSON-serializes and includes a `version` field in the stored
> shape (so future schema changes can be detected and migrated instead of silently breaking).
> Wire timer settings, planner data, and completed-pomodoro counts through this wrapper —
> no raw `localStorage.getItem` calls scattered in components.

**Acceptance criteria:**
- [ ] All persistence goes through `storage.ts`, nothing calls `localStorage` directly elsewhere
- [ ] Refreshing the page preserves today's planner data and timer state
- [ ] Stored data includes a version key

---

## Phase 7 — PWA (installable, offline)

**Agent prompt:**
> Add `vite-plugin-pwa`, configure a manifest (name, short_name, theme_color matching the
> cover/tomato palette, icons at 192/512px), and enable a generated service worker (don't
> hand-write one) with an offline-first cache strategy for the app shell. Verify the app is
> installable (Chrome DevTools > Application > Manifest shows no errors) and that reloading
> while offline still loads the shell.

**Acceptance criteria:**
- [ ] Lighthouse PWA audit passes installability checks
- [ ] App works offline after first load
- [ ] Icons render correctly on a phone home screen

---

## Phase 8 — Tests & deploy

**Agent prompt:**
> Add React Testing Library coverage for `TimerControls` (start/pause/resume/skip/reset
> button behavior) and `TopPriorities` (the 3-slot cap). Then set up deployment to Vercel:
> connect the repo, confirm the build command (`npm run build`) and output dir (`dist`) are
> correct, and produce a live URL.

**Acceptance criteria:**
- [ ] `npm run test` passes in CI (or locally) with meaningful component coverage
- [ ] Live deployed URL loads the app correctly
- [ ] README updated with the live link and a short project description for your portfolio
