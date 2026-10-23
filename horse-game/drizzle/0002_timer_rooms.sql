CREATE TABLE timer_rooms (
  code TEXT PRIMARY KEY,
  host_token_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'lobby',
  target_ms INTEGER NOT NULL DEFAULT 10000,
  penalty TEXT NOT NULL DEFAULT 'Take one sip (or choose a non-alcoholic alternative)',
  start_at INTEGER,
  round INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE timer_players (
  id TEXT PRIMARY KEY,
  room_code TEXT NOT NULL REFERENCES timer_rooms(code) ON DELETE CASCADE,
  name TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  joined_at INTEGER NOT NULL,
  seen_at INTEGER NOT NULL,
  tap_ms INTEGER,
  submitted_at INTEGER
);
--> statement-breakpoint
CREATE INDEX timer_players_room ON timer_players (room_code, joined_at ASC);
--> statement-breakpoint
CREATE INDEX timer_rooms_updated ON timer_rooms (updated_at);
