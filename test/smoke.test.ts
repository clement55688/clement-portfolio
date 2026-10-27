import assert from "node:assert/strict";
import test from "node:test";
import { parseScoreSubmission } from "../src/lib/scores.ts";
import { siteUrl } from "../src/lib/site.ts";

test("accepts an in-range snake score and rejects a bad payload", () => {
  const ok = parseScoreSubmission({ name: "  Ada  ", score: 12 });
  assert.equal(ok.ok, true);
  if (ok.ok) assert.deepEqual(ok.value, { name: "Ada", score: 12 });

  const blank = parseScoreSubmission({ score: 0 });
  assert.equal(blank.ok && blank.value.name, "Anonymous");

  for (const body of [null, [], { score: 100_000 }, { score: -1 }, { score: 1.5 }, { score: "12" }, { name: 1, score: 1 }]) {
    assert.equal(parseScoreSubmission(body).ok, false);
  }
});

test("site URL comes from NEXT_PUBLIC_SITE_URL", () => {
  const previous = process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.NEXT_PUBLIC_SITE_URL;
  assert.equal(siteUrl(), "http://localhost:3000");
  process.env.NEXT_PUBLIC_SITE_URL = "https://clement-portfolio.a2040404.workers.dev/path";
  assert.equal(siteUrl(), "https://clement-portfolio.a2040404.workers.dev");
  if (previous === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = previous;
});
