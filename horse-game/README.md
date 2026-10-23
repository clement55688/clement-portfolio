# HOOF.

Four legs. Zero coordination. A tiny, phone-friendly horse game with four individual leg controls, a local personal best, optional sound, and challenge links. No accounts, backend, API keys, or installation required to play.

## Develop on Windows or macOS

Install Node.js 20 or newer, then from this folder run:

```sh
npm run dev
```

Open http://localhost:4173. Edit `dist/index.html`, `dist/style.css`, and `dist/game.js` and refresh. There are no dependencies to install and no build step. `npm test` checks the game rules.

## Play

Click **PLAY**, then tap the numbered colored buttons or press **Q W O P**. Match the numbers on the horse: 1 → 4 → 2 → 3 (Q → P → W → O) at roughly three taps per second. The portrait layout uses two rows of large buttons, horse diagrams, and a live balance meter. The horse loses speed quickly, trips on rushed taps, and gets tired over distance. Repeating a leg tips it over. After the first tap, stopping for 2.4 seconds ends the run; before the first tap there is a 4.5-second grace period. Switching tabs pauses the game. Best distance is saved only on the current browser. This harder ruleset uses a new record key and versioned challenge links so earlier, easier scores are kept separate. Scores are casual and not verified by a server.

## Free hosting

The complete static site is in `dist/`. It runs on static hosting, including GitHub Pages. The repository workflow `.github/workflows/hoof-pages.yml` can deploy this folder through GitHub Pages when enabled: repository **Settings → Pages → Source → GitHub Actions**, then run **Deploy HOOF to GitHub Pages** from Actions. This workflow is manual so it will not replace an existing Pages site accidentally.

The game uses system font fallbacks if Google Fonts is unavailable. All horse art is drawn in Canvas. Audio is synthesized locally and starts only after enabling sound.
