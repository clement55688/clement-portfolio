# Clement Arcade

A collection of mini-games in Clement's Gaming Room, including HOOF!, Catvolution, Swim Off, Remembrance Flight, TEN.00, and Itchy Business. No player accounts required.

## Develop on Windows or macOS

Install Node.js 22.13 or newer (Node 24 recommended), then run from this folder:

```sh
npm run dev
```

Open http://localhost:4173. No dependencies to install. Edit `dist/index.html`, `dist/style.css`, and `dist/game.js`, then refresh. The local leaderboard uses SQLite in the ignored `.local/` folder and is separate from production.

```sh
npm run build
npm test
```

The build embeds the client files and game rules into `dist/server/index.js`, a dependency-free Worker. Build before running tests, which also verify the generated Worker. Generated output is ignored by Git.

## Trail mode

Each run lasts up to **90 seconds**. Alternate legs at a comfortable pace; 1 → 4 → 2 → 3 (keyboard Q → P → W → O) is a useful guide, not a mandatory sequence.

The first 40 meters are flat and forgiving. The trail then climbs for 40 meters and descends for 40 meters. This 120-meter cycle repeats, getting gradually steeper up to level 6. Gravity slows the horse uphill and adds momentum downhill. The visible road, horse angle, speed, and balance all use the same terrain function.

The horse naturally settles upright; alternating legs helps it recover from mistakes. Continually repeating a leg causes a fall. Stopping for 3.6 seconds after the first tap ends the run, with a 5-second initial grace period. Switching tabs pauses it. The timer stops at 90 seconds and the final distance can be submitted.

## Leaderboard

After finishing, choose **Put my name on the board**, enter a name (1–16 letters/numbers, spaces, underscores, periods or hyphens), and submit. Names and distances are public. Top 10 shows the best run per case-insensitive name; names are display labels, not authenticated accounts. Personal best and remembered name are stored on the device.

The server replays recorded inputs on the same fixed 20 ms simulation used in the browser, so a client-provided score is never trusted. Incomplete runs, invalid timing, duplicate replay hashes, oversized requests, and excessive submissions are rejected. A name is not proof of identity, and scripted valid replays remain possible; this is a casual leaderboard, not a prize competition.

Trail mode is ruleset 3. Earlier scores remain stored under ruleset 2 and are excluded from the current trail leaderboard. Device records and challenge links also carry the new ruleset. Migration 0001 adds the version column without deleting scores.

## Hosting

Live game: https://hoof-clement.smokygoose67.chatgpt.site

Sites publishes the Worker with the D1 binding `DB`, declared in `.openai/hosting.json`. Schema migrations live in `drizzle/`; hosted deployment applies them. All image assets are embedded into the Worker during the build. Preserve this Site project ID on future updates. A static-only host such as GitHub Pages cannot run the shared leaderboard.

The repository workflow checks the game and Worker without deploying the portfolio. All horse artwork is drawn in Canvas. Google Fonts has system fallbacks; optional audio is generated locally.

## UI research

The redesign applies visual hierarchy, contrast, restrained type sizes, and large separated touch controls:

- https://www.nngroup.com/articles/principles-visual-design/
- https://www.nngroup.com/articles/touch-target-size/
