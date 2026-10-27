export const JOB_DESCRIPTION_MIN_CHARS = 80;
export const JOB_DESCRIPTION_MAX_CHARS = 8_000;

export const fitMessages = {
  invalid: "Paste the job description as text.",
  tooShort: "Paste a fuller job description — at least a few sentences — so the comparison is meaningful.",
  tooLong: "That job description is over 8,000 characters. Trim it and try again.",
  rateLimited: "Too many fit checks from this network. Wait a minute and try again.",
  aiUnavailable: "The fit checker is offline right now. Please try again in a little while.",
  badResponse: "I couldn’t produce a grounded assessment from that description. Please try again.",
} as const;

export type JobDescriptionResult = { ok: true; value: string } | { ok: false; message: string };

export function validateJobDescription(body: unknown): JobDescriptionResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, message: fitMessages.invalid };
  }
  const value = (body as { jobDescription?: unknown }).jobDescription;
  if (typeof value !== "string") return { ok: false, message: fitMessages.invalid };
  const text = value.trim();
  if (text.length < JOB_DESCRIPTION_MIN_CHARS) return { ok: false, message: fitMessages.tooShort };
  if (text.length > JOB_DESCRIPTION_MAX_CHARS) return { ok: false, message: fitMessages.tooLong };
  return { ok: true, value: text };
}
