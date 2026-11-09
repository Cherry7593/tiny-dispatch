# Third-party notices

## Actual official sample reused

Source: https://github.com/google/web-game-samples/tree/4310035578c205ff503872face8ec91246314af3/phaser

Inspected upstream revision: `4310035578c205ff503872face8ec91246314af3`; Phaser sample under `phaser/`.

The **phaser subtree's LICENSE is MIT**, copyright (c) 2024 Phaser Studio Inc. Its package.json also declares MIT and identifies `phaserjs/template-youtube-playables` as its template repository. The enclosing google/web-game-samples root LICENSE is **Apache-2.0**. These are different files and scopes; Google Developers documentation's Apache-2.0 code-sample policy is not the license asserted for this Phaser subtree. Both original license files are reproduced under `public/licenses/` and included in both distribution folders.

Reuse and modifications:

- `vite/config.dev.mjs`: copied the sample's actual Vite development configuration, relative base, Phaser manual chunk, and port 8080.
- `vite/config.prod.mjs`: adapted the sample's actual relative-base, Phaser manual chunk, Terser two-pass/minification settings. Removed its promotional build-log plugin. Added separate standalone/Playables output directories and SDK-first HTML injection.
- `src/main.js` / `src/town.js`: adapted the actual `src/main.js` Phaser.Game / scenes bootstrap pattern into a single puzzle scene with semantic DOM controls. Replaced Matter basketball physics and all sample scenes, art, assets and game objects with original deterministic routing and vector graphics.
- `src/platform.js`: adapted `src/YouTubePlayables.js`'s readiness flags, environment boundary, game data APIs, language, platform audio and pause callback architecture. Replaced the singleton with a dependency-injected, testable adapter. Added load-before-write guards and bounded reads, propagated errors, and removed scores, ads, health reporting and unused sample APIs. Save writes deliberately await their real completion; the save queue never overlaps a late cloud write.
- Dependencies: pinned Phaser 3.90.0, Vite 6.4.6 and Terser 5.44.1. Vite was updated from the sample's 6.3.6 after audit identified development-server vulnerabilities; canonical 6.4.6 release checked at https://github.com/vitejs/vite/releases/tag/v6.4.6.

## Phaser 3.90.0

https://github.com/phaserjs/phaser/tree/v3.90.0 — MIT. The installed LICENSE.md states **Copyright (c) 2024 Richard Davey, Phaser Studio Inc.** Individual source headers also carry 2013–2025 Phaser Studio Inc. notices. Phaser is the actual canvas renderer, scene manager and running game clock. Its full installed license is included at `public/licenses/Phaser-3.90-MIT.txt`.

`DispatchGame.start()` in `src/town.js` additionally adapts the installed MIT `phaser/src/core/Game.js` start method. Its implicit VisibilityHandler and focus/blur resume handlers are omitted so only our platform adapter controls pause/resume. The installed 3.90 source establishes this protected override; it must be rechecked on future Phaser upgrades. No global document event interception is used in production.

Phaser's bundled EventEmitter3 dependency is MIT (https://github.com/primus/eventemitter3), copyright (c) 2014 Arnout Kazemier. Included at `public/licenses/EventEmitter3-MIT.txt`. No Spine plugin/runtime is imported or distributed separately.

## Self-hosted font

Lilita One, **Copyright (c) 2011 Juan Montoreano (juan@remolacha.biz), with Reserved Font Name Lilita**, as stated in the actual OFL.txt. SIL Open Font License 1.1. Downloaded from the canonical Google Fonts repository:

- https://github.com/google/fonts/blob/main/ofl/lilitaone/LilitaOne-Regular.ttf
- https://github.com/google/fonts/blob/main/ofl/lilitaone/OFL.txt

Font bytes: `public/lilita-one.ttf`; unmodified license: `public/licenses/LilitaOne-OFL.txt`. Used only for the Latin game title, self-hosted with no font service calls. Chinese text uses platform CJK fonts.

## Original work / external runtime boundary

Road maps, scenery, parcels, vans, icons, puzzle engine, twelve authored boards, interface copy, styling and synthesized WebAudio sound effects were authored for this project. No raster game assets or generated raster assets ship. No basketball assets were copied. Phaser's built-in textures are part of Phaser, not external artwork.

Standalone performs no external runtime requests. The Playables build requests only the required `https://www.youtube.com/game_api/v1` SDK in addition to its own relative assets. Official SDK documentation was consulted at https://developers.google.com/youtube/gaming/playables/reference/sdk to verify current signatures and language/save/pause/audio requirements; documentation licensing is not substituted for the template's MIT license.
