import type { Profile } from "../../data/profile";
import { buildInstructInput, extractModelText, WORKERS_AI_INSTRUCT_MODEL, type WorkersAiBinding } from "../ai/instruct";
import { consumeRateLimit, type RateBucket } from "../ai/rate-limit";
import { fitMessages, validateJobDescription } from "./input";
import { parseFitAssessment } from "./parse";
import { buildFitMessages } from "./prompt";
import type { FitAssessment } from "./types";

export const FIT_MAX_OUTPUT_TOKENS = 800;
export const FIT_TEMPERATURE = 0.1;
export const FIT_RATE_LIMIT = 5;
export const FIT_RATE_WINDOW_MS = 60_000;

export type FitFailureCode = "invalid_input" | "rate_limited" | "ai_unavailable" | "bad_response";

export type AssessFitResult =
  | { ok: true; assessment: FitAssessment }
  | { ok: false; code: FitFailureCode; message: string; retryAfterSeconds?: number };

export async function assessFit(args: {
  body: unknown;
  profile: Profile;
  ai: WorkersAiBinding | null;
  clientKey: string;
  rates: RateBucket;
  now?: number;
}): Promise<AssessFitResult> {
  const job = validateJobDescription(args.body);
  if (!job.ok) return { ok: false, code: "invalid_input", message: job.message };
  if (!args.ai) return { ok: false, code: "ai_unavailable", message: fitMessages.aiUnavailable };

  const limited = consumeRateLimit(args.rates, args.clientKey, args.now ?? Date.now(), FIT_RATE_LIMIT, FIT_RATE_WINDOW_MS);
  if (!limited.ok) {
    return { ok: false, code: "rate_limited", message: fitMessages.rateLimited, retryAfterSeconds: limited.retryAfterSeconds };
  }

  const messages = buildFitMessages(args.profile, job.value);
  const input = buildInstructInput(messages, {
    maxTokens: FIT_MAX_OUTPUT_TOKENS,
    temperature: FIT_TEMPERATURE,
    json: true,
  });

  let text: string | null = null;
  try {
    text = extractModelText(await args.ai.run(WORKERS_AI_INSTRUCT_MODEL, input));
  } catch {
    return { ok: false, code: "ai_unavailable", message: fitMessages.aiUnavailable };
  }
  if (!text) return { ok: false, code: "bad_response", message: fitMessages.badResponse };

  const parsed = parseFitAssessment(text, args.profile);
  if (!parsed.ok) return { ok: false, code: "bad_response", message: fitMessages.badResponse };
  return { ok: true, assessment: parsed.value };
}
