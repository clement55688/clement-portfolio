# HOOF.

Four legs. Zero coordination. A tiny, phone-friendly horse game with four individual leg controls, a local personal best, optional sound, and challenge links. No accounts, backend, API keys, or installation required to play.

## Develop on Windows or macOS

Install Node.js 20 or newer, then from this folder run:

```sh
npm run dev
```

Open http://localhost:4173. Edit `dist/index.html`, `dist/style.css`, and `dist/game.js` and refresh. There are no dependencies to install and no build step. `npm test` checks the game rules.

## Play

Click **LET’S TROT**, then tap the colored buttons or press **Q W O P**. Try Q → P → W → O at roughly three taps per second. Diagonal strides build speed; repeating one leg tips the horse. After 4.5 seconds without a tap the run ends. Switching tabs pauses the game. Best distance is saved only on the current browser. A challenge link includes the distance to beat; scores are casual and not verified by a server.

## Free hosting

The complete static site is in `dist/`. It runs on static hosting, including GitHub Pages. The repository workflow `.github/workflows/hoof-pages.yml` can deploy this folder through GitHub Pages when enabled: repository **Settings → Pages → Source → GitHub Actions**, then run **Deploy HOOF to GitHub Pages** from Actions. This workflow is manual so it will not replace an existing Pages site accidentally.

The game uses system font fallbacks if Google Fonts is unavailable. All horse art is drawn in Canvas. Audio is synthesized locally and starts only after enabling sound.
