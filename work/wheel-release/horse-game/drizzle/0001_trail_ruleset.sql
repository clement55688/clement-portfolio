ALTER TABLE hoof_scores ADD COLUMN ruleset INTEGER NOT NULL DEFAULT 2;
--> statement-breakpoint
CREATE INDEX hoof_scores_season ON hoof_scores (ruleset, score DESC, created_at ASC);
