import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
export function localDatabase(filename = ':memory:') {
  const db = new DatabaseSync(filename);
  if (!db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'hoof_scores'").get()) db.exec(readFileSync(new URL('./drizzle/0000_leaderboard.sql', import.meta.url), 'utf8'));
  if (!db.prepare('PRAGMA table_info(hoof_scores)').all().some(column => column.name === 'ruleset')) db.exec(readFileSync(new URL('./drizzle/0001_trail_ruleset.sql', import.meta.url), 'utf8'));
  if (!db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'timer_rooms'").get()) db.exec(readFileSync(new URL('./drizzle/0002_timer_rooms.sql', import.meta.url), 'utf8'));
  return { close: () => db.close(), prepare(sql) {
    const statement = db.prepare(sql);
    function bind(...args) { return { bind, async first() { return statement.get(...args); }, async all() { return { results: statement.all(...args) }; }, async run() { const result = statement.run(...args); return { meta: { changes: Number(result.changes) } }; } }; }
    return bind();
  } };
}
