CREATE TABLE hoof_scores (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  name_key TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score > 0),
  replay_hash TEXT NOT NULL UNIQUE,
  ip_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX hoof_scores_ranking ON hoof_scores (score DESC, created_at ASC);
--> statement-breakpoint
CREATE INDEX hoof_scores_rate ON hoof_scores (ip_hash, created_at);
