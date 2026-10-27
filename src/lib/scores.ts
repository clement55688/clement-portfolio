export const SCORE_NAME_MAX = 24;
export const SCORE_MAX = 99_999;

export type ScoreSubmission = { name: string; score: number };

export function parseScoreSubmission(
  body: unknown,
): { ok: true; value: ScoreSubmission } | { ok: false; error: string } {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Score payload must be an object." };
  }
  const record = body as Record<string, unknown>;
  const score = record.score;
  if (typeof score !== "number" || !Number.isInteger(score) || score < 0 || score > SCORE_MAX) {
    return { ok: false, error: "Score must be an integer from 0 to 99999." };
  }
  if (record.name !== undefined && typeof record.name !== "string") {
    return { ok: false, error: "Name must be a string." };
  }
  const trimmed = typeof record.name === "string" ? record.name.trim().slice(0, SCORE_NAME_MAX) : "";
  return { ok: true, value: { name: trimmed || "Anonymous", score } };
}
