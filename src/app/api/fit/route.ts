import { profile } from "@/data/profile";
import { getWorkersAi } from "@/lib/ai/binding";
import { clientKeyFromHeaders, type RateBucket } from "@/lib/ai/rate-limit";
import { assessFit, type FitFailureCode } from "@/lib/fit/assess";

const rates: RateBucket = new Map();

const statusFor: Record<FitFailureCode, number> = {
  invalid_input: 400,
  rate_limited: 429,
  ai_unavailable: 503,
  bad_response: 502,
};

export async function POST(request: Request) {
  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const result = await assessFit({
    body,
    profile,
    ai: getWorkersAi(),
    clientKey: clientKeyFromHeaders(request.headers),
    rates,
  });

  const headers = new Headers({ "cache-control": "no-store" });
  if (!result.ok) {
    if (result.retryAfterSeconds) headers.set("retry-after", String(result.retryAfterSeconds));
    return Response.json({ error: result.message }, { status: statusFor[result.code], headers });
  }

  return Response.json({ assessment: result.assessment }, { status: 200, headers });
}
