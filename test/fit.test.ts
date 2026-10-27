import assert from "node:assert/strict";
import test from "node:test";
import { profile } from "../src/data/profile.ts";
import { buildInstructInput, INSTRUCT_OUTPUT_TOKEN_CAP, WORKERS_AI_INSTRUCT_MODEL, type WorkersAiBinding } from "../src/lib/ai/instruct.ts";
import { clientKeyFromHeaders, consumeRateLimit } from "../src/lib/ai/rate-limit.ts";
import { assessFit, FIT_MAX_OUTPUT_TOKENS, FIT_TEMPERATURE } from "../src/lib/fit/assess.ts";
import { fitMessages, JOB_DESCRIPTION_MAX_CHARS, JOB_DESCRIPTION_MIN_CHARS, validateJobDescription } from "../src/lib/fit/input.ts";
import { parseFitAssessment } from "../src/lib/fit/parse.ts";
import { buildFitMessages, renderProfileForPrompt } from "../src/lib/fit/prompt.ts";

const jobDescription = `${"Build React and FastAPI services, ship data pipelines, and mentor engineers. ".repeat(3)}Kubernetes is a plus.`;

function modelJson(overrides: Record<string, unknown> = {}) {
  return {
    summary: "Clement’s React and FastAPI work at Rhombus Power lines up with this role. The profile does not show Kubernetes as a primary responsibility.",
    matches: [
      {
        requirement: "React and FastAPI in production",
        sourceIds: ["role-rhombus"],
        evidence: "Clement spent a decade writing Rust at SpaceX.",
      },
    ],
    gaps: [{ requirement: "Kubernetes platform ownership", note: "Kubernetes appears only as a skill and in an internship bullet, not as platform ownership.", partial: true }],
    lookAt: [
      { id: "role-rhombus", why: "This is the role where he shipped React and FastAPI." },
      { id: "repo-portfolio", why: "The public portfolio shows the frontend work." },
    ],
    ...overrides,
  };
}

test("prompt is grounded in the profile and omits contact details", () => {
  const messages = buildFitMessages(profile, jobDescription);
  const text = messages.map((message) => message.content).join("\n");
  assert.equal(messages[0]?.role, "system");
  assert.equal(messages[1]?.role, "user");
  assert.match(text, /Never invent/);
  assert.match(text, /Rhombus Power/);
  assert.match(text, /OCBridge/);
  assert.match(text, /https:\/\/hoof-game\.a2040404\.workers\.dev\/catvolution\//);
  assert.match(text, /python-coding-interview-practice/);
  assert.match(text, /react-library-oa-practice/);
  assert.match(text, /clement-portfolio/);
  assert.match(text, /role-rhombus/);
  assert.match(text, /repo-arcade/);
  assert.ok(text.includes(jobDescription));
  const profileText = JSON.stringify(profile);
  assert.equal(text.includes("@"), false);
  assert.equal(profileText.includes("@"), false);
  assert.equal(/(?:\+\d{1,2}[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/.test(text), false);
  assert.equal(/(?:\+\d{1,2}[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/.test(profileText), false);
  assert.match(renderProfileForPrompt(profile), /PS5\/Nintendo Inventory Scraper/);
  const ids = profile.entries.map((entry) => entry.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("instruct request stays small, cool, and JSON-shaped", () => {
  const input = buildInstructInput(buildFitMessages(profile, jobDescription), {
    maxTokens: FIT_MAX_OUTPUT_TOKENS,
    temperature: FIT_TEMPERATURE,
    json: true,
  });
  assert.equal(input.max_tokens, 800);
  assert.ok(input.max_tokens <= INSTRUCT_OUTPUT_TOKEN_CAP);
  assert.equal(input.temperature, 0.1);
  assert.deepEqual(input.response_format, { type: "json_object" });

  const clamped = buildInstructInput([{ role: "user", content: "hi" }], { maxTokens: 9_000, temperature: 4 });
  assert.equal(clamped.max_tokens, INSTRUCT_OUTPUT_TOKEN_CAP);
  assert.equal(clamped.temperature, 1);
  assert.equal("response_format" in clamped, false);
});

test("job description validation trims and enforces the 8k cap", () => {
  const exact = "a".repeat(JOB_DESCRIPTION_MAX_CHARS);
  const ok = validateJobDescription({ jobDescription: `  ${exact}  ` });
  assert.equal(ok.ok, true);
  if (ok.ok) assert.equal(ok.value, exact);

  const minimum = validateJobDescription({ jobDescription: "b".repeat(JOB_DESCRIPTION_MIN_CHARS) });
  assert.equal(minimum.ok, true);

  const short = validateJobDescription({ jobDescription: "b".repeat(JOB_DESCRIPTION_MIN_CHARS - 1) });
  assert.equal(short.ok, false);
  if (!short.ok) assert.equal(short.message, fitMessages.tooShort);

  const longBody = "c".repeat(JOB_DESCRIPTION_MAX_CHARS + 1);
  const long = validateJobDescription({ jobDescription: longBody });
  assert.equal(long.ok, false);
  if (!long.ok) {
    assert.equal(long.message, fitMessages.tooLong);
    assert.equal(long.message.includes(longBody), false);
  }

  for (const body of [null, [], "a job", { jobDescription: 12 }, { note: exact }]) {
    const result = validateJobDescription(body);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.message, fitMessages.invalid);
  }
});

test("parser keeps profile evidence and drops invented sources", () => {
  const parsed = parseFitAssessment(`\`\`\`json\n${JSON.stringify(modelJson())}\n\`\`\``, profile);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.match(parsed.value.matches[0]?.sources[0]?.highlights.join(" ") ?? "", /Unified Force Structure Planner/);
  assert.equal(JSON.stringify(parsed.value).includes("SpaceX"), false);
  assert.equal(parsed.value.gaps[0]?.partial, true);
  assert.deepEqual(
    parsed.value.lookAt.map((item) => item.id),
    ["role-rhombus", "repo-portfolio"],
  );
  assert.equal(parsed.value.lookAt[0]?.title, "Software Engineer, Full Stack");
  assert.equal(parsed.value.lookAt[1]?.url, "https://github.com/clement55688/clement-portfolio");

  const prose = parseFitAssessment(`Here you go:\n${JSON.stringify(modelJson())}\nThanks`, profile);
  assert.equal(prose.ok, true);

  const invented = parseFitAssessment(
    modelJson({
      matches: [{ requirement: "Rust at SpaceX", sourceIds: ["role-spacex", "role-rhombus"] }],
      lookAt: [
        { id: "role-spacex", why: "Invented employer." },
        { id: "role-rhombus", why: "Real full-stack role." },
        { id: "repo-arcade", why: "Public game." },
        { id: "skills", why: "Skills are not a project or role." },
        { id: "repo-python-interviews", why: "Fourth item should be trimmed." },
      ],
    }),
    profile,
  );
  assert.equal(invented.ok, true);
  if (!invented.ok) return;
  assert.equal(invented.value.matches[0]?.sources.length, 1);
  assert.equal(invented.value.matches[0]?.sources[0]?.id, "role-rhombus");
  assert.deepEqual(
    invented.value.lookAt.map((item) => item.id),
    ["role-rhombus", "repo-arcade", "repo-python-interviews"],
  );

  const ungrounded = parseFitAssessment(
    modelJson({
      matches: [{ requirement: "Rust at SpaceX", sourceIds: ["role-spacex"] }],
      gaps: [],
    }),
    profile,
  );
  assert.equal(ungrounded.ok, false);

  const thin = parseFitAssessment(modelJson({ lookAt: [{ id: "role-rhombus", why: "Only one real entry." }] }), profile);
  assert.equal(thin.ok, false);

  const leaked = parseFitAssessment(modelJson({ summary: "Email him at recruiter@example.com or 555-010-0199 about this role." }), profile);
  assert.equal(leaked.ok, false);
});

test("assessFit mocks the model, limits calls, and fails gently", async () => {
  const calls: Array<{ model: string; input: Record<string, unknown> }> = [];
  const ai: WorkersAiBinding = {
    async run(model, input) {
      calls.push({ model, input });
      return { response: JSON.stringify(modelJson()) };
    },
  };
  const rates = new Map<string, number[]>();
  const body = { jobDescription };

  const first = await assessFit({ body, profile, ai, clientKey: "203.0.113.8", rates, now: 1_000 });
  assert.equal(first.ok, true);
  if (first.ok) assert.match(first.assessment.summary, /Rhombus Power/);
  assert.equal(calls[0]?.model, WORKERS_AI_INSTRUCT_MODEL);
  const sent = calls[0]?.input;
  assert.equal(sent?.max_tokens, FIT_MAX_OUTPUT_TOKENS);
  assert.equal(sent?.temperature, FIT_TEMPERATURE);
  assert.deepEqual(sent?.response_format, { type: "json_object" });
  assert.match(JSON.stringify(sent?.messages), /Never invent/);

  const offline = await assessFit({ body, profile, ai: null, clientKey: "203.0.113.8", rates: new Map(), now: 1_000 });
  assert.equal(offline.ok, false);
  if (!offline.ok) {
    assert.equal(offline.code, "ai_unavailable");
    assert.equal(offline.message, fitMessages.aiUnavailable);
  }

  const thrown = await assessFit({
    body,
    profile,
    ai: {
      async run() {
        throw new Error("binding down");
      },
    },
    clientKey: "203.0.113.9",
    rates: new Map(),
    now: 1_000,
  });
  assert.equal(thrown.ok, false);
  if (!thrown.ok) assert.equal(thrown.code, "ai_unavailable");

  const garbage = await assessFit({
    body,
    profile,
    ai: {
      async run() {
        return { response: "not json" };
      },
    },
    clientKey: "203.0.113.10",
    rates: new Map(),
    now: 1_000,
  });
  assert.equal(garbage.ok, false);
  if (!garbage.ok) {
    assert.equal(garbage.code, "bad_response");
    assert.equal(garbage.message, fitMessages.badResponse);
  }

  const before = calls.length;
  const invalid = await assessFit({ body: { jobDescription: "too short" }, profile, ai, clientKey: "203.0.113.8", rates, now: 1_000 });
  assert.equal(invalid.ok, false);
  if (!invalid.ok) assert.equal(invalid.code, "invalid_input");
  assert.equal(calls.length, before);

  for (let i = 0; i < 4; i += 1) {
    const next = await assessFit({ body, profile, ai, clientKey: "203.0.113.8", rates, now: 1_000 });
    assert.equal(next.ok, true);
  }
  const blocked = await assessFit({ body, profile, ai, clientKey: "203.0.113.8", rates, now: 1_000 });
  assert.equal(blocked.ok, false);
  if (!blocked.ok) {
    assert.equal(blocked.code, "rate_limited");
    assert.equal(blocked.message, fitMessages.rateLimited);
    assert.equal(blocked.retryAfterSeconds, 60);
  }
  assert.equal(calls.length, 5);

  const later = await assessFit({ body, profile, ai, clientKey: "203.0.113.8", rates, now: 1_000 + 60_000 });
  assert.equal(later.ok, true);

  const headers = new Headers({ "x-forwarded-for": "198.51.100.4, 10.0.0.1", "cf-connecting-ip": "203.0.113.8" });
  assert.equal(clientKeyFromHeaders(headers), "203.0.113.8");
  assert.equal(clientKeyFromHeaders(new Headers({ "x-forwarded-for": "198.51.100.4" })), "198.51.100.4");
  assert.equal(clientKeyFromHeaders(new Headers()), "unknown");

  const bucket = new Map<string, number[]>();
  for (let i = 0; i < 5; i += 1) assert.equal(consumeRateLimit(bucket, "ip", 50, 5, 60_000).ok, true);
  assert.equal(consumeRateLimit(bucket, "ip", 50, 5, 60_000).ok, false);
  assert.equal(consumeRateLimit(bucket, "ip", 50 + 60_000, 5, 60_000).ok, true);
});
