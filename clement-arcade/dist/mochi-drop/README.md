# MOCHI DROP · 合成大胖貓

Standalone Suika-style cat drop-and-merge game at `/mochi-drop/`. Existing
Catvolution/2048 remains separate. Open from the arcade's seventh carousel card.
Run the existing arcade server (`pnpm run dev:games` at repo root); no new install,
API key, CDN, backend or database migration is required.

- `physics.mjs`: fixed 120 Hz Matter.js simulation, pair merging, growth,
  bounded drops, overflow grace period and validated save/restore.
- `stages.mjs`: eleven radii, names and score awards; daily sequence seed.
- `game.js`: canvas drawing, effects, pointer/keyboard input, audio, dialogs,
  local collection, personal records, sharing and auto-save.
- `style.css`: responsive cream/peach game UI. `card.css` styles only its arcade card.
- `cats/0.webp` … `10.webp`: new original ImageGen transparent spherical cat
  illustrations. Generated as an evenly spaced 3×4 atlas (last cell blank),
  then cropped into cells, alpha-trimmed, resized to 320px, and encoded as WebP.
  Progression: sleepy newborn → baby → kitten → cheeky kitten → fluffy kitten →
  laughing chonk → big floof → belly chonk → lion floof → cat king → cosmic cat.
  These are not reused Suika artwork or assets from another game.
- `vendor/matter.min.js`: unmodified Matter.js 0.20.0 distribution from the
  official npm tarball, with the MIT license prepended. Full license is also
  retained in `vendor/MATTER-LICENSE.txt`. No package/lockfile changes.

Drag/release, click, or use ←/→ and Space/Enter. P/Escape pauses. Backgrounding
pauses automatically. Equal levels merge once per pair; two final cats clear for
1,000 points. No power-ups, ads, paid continues or sign-in. The first five tiers
can drop; all eleven can be made by merging. A kitten above the line gets a
falling grace period; sustained overflow ends the run after 2.4 seconds.

`mochi-drop-profile-v1` and `mochi-drop-run-v1` are device-local localStorage keys.
Profile records and collection survive restart; interrupted runs can resume.
Daily challenge URLs use `?daily=YYYY-MM-DD`; equal dates give the same drop
sequence, not a claim of identical physics across platforms. Records are local,
not a shared leaderboard. Audio defaults off and is synthesized after interaction.
Reduced-motion preferences disable decorative squash/pop/shake effects.

Check: `pnpm --dir clement-arcade run check`. Physics tests use the same vendored
engine in Node; route packaging tests include this page and its linked assets.
