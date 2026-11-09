# Tiny Dispatch · 小小快递站

**[Play in your browser](https://cherry7593.github.io/tiny-dispatch/)**

A small, complete two-van routing puzzle. Set the junction signs, choose where to wait one beat, then dispatch both vans together. Deliver A to coral A and B to teal B without meeting on the same cell or swapping places head-on.

- 12 hand-authored levels: turns, crossings, timed waits, detours and shared roads
- English / 简体中文, touch / mouse / keyboard, portrait / landscape
- Undo, reset, instant retry, hints and automatic progress saving
- Original vector artwork and synthesized sound effects
- No registration, ads, analytics or runtime asset services

Built on the official Google Playables Phaser/Vite sample with Phaser 3.90; see [third-party notices](THIRD_PARTY_NOTICES.md). Original project code is MIT, copyright Chryui.

## Run

Node 22+ (tested with Node 24).

```sh
npm ci
npm run dev
```

Open http://localhost:8080. Click a circular junction to cycle straight → left → right, **relative to the arriving van's heading**. Ordinary corners turn automatically. Toggle a dashed waiting pad to stop arriving vans for one beat. Delivered vans leave the road. Plan without a time limit; failed routes freeze with their cause shown.

Keyboard: Tab selects controls, Enter/Space activates; on a junction, Up/Left/Right selects straight/left/right. Escape closes help and level selection.

## Verify and build

```sh
npm test
npm run verify:levels
npx playwright install chromium webkit firefox
npm run test:e2e
npm run build
npm run build:playables
npm run smoke
npm run smoke:playables
npm run package:playables
BASE_URL=https://cherry7593.github.io/tiny-dispatch/ npm run smoke
```

Unit tests cover routing, same-cell/head-on collisions, waiting and save/SDK behavior. Exhaustive validation checks 100,128 route/wait configurations across all 12 levels. E2E tests use real controls to complete every level and cover six screen sizes, retry/undo, language, save failure, reload and pause. SDK tests use explicitly identified mocks, not actual YouTube certification.

`dist/` is a standalone offline-capable static distribution (no YouTube network requirement). `dist-playables/` loads the official SDK before game code, with relative assets and a root `index.html`. `tiny-dispatch-playables.zip` is the packaging output. GitHub Pages serves the committed standalone build from `docs/`.

## YouTube Playables boundary

This is a public demo for a subsequent developer application, **not an accepted or certified YouTube Playable**. Official SDK test suite, real YouTube Android/iOS preview, age rating and publication review remain part of the admission/release process.

In the Playables environment the adapter uses SDK readiness, language, audio, pause and cloud saving; standalone saves in the browser. Cloud reads must succeed before writes. Failed or newer saves are not silently overwritten. Phaser's source-grounded `Game.start()` override omits automatic visibility handling; recheck it when upgrading Phaser.

Progress is local to this browser in the public demo. Clearing site data removes it. When storage is blocked, the game stays playable and shows a save warning. Screenshots and test artifacts are not published with source.
