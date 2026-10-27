import { findEntry, type Profile, type ProfileEntry } from "../../data/profile";
import type { FitAssessment, FitGap, FitLookAt, FitMatch, FitSource } from "./types";

const LOOK_AT_KINDS = new Set<ProfileEntry["kind"]>(["role", "project", "repository"]);
const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE = /(?:\+\d{1,2}[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/;

export type ParseResult = { ok: true; value: FitAssessment } | { ok: false; message: string };

export function parseFitAssessment(raw: unknown, source: Profile): ParseResult {
  let payload = raw;
  if (typeof raw === "string") {
    try {
      payload = parseJsonObject(raw);
    } catch {
      return { ok: false, message: "The model did not return JSON." };
    }
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, message: "The model did not return an object." };
  }

  const record = payload as Record<string, unknown>;
  const summary = cleanText(record.summary, 800);
  if (!summary || summary.length < 20 || mentionsContact(summary)) {
    return { ok: false, message: "The summary was missing or not usable." };
  }

  const matches = readMatches(record.matches, source);
  const gaps = readGaps(record.gaps);
  if (!matches || !gaps) return { ok: false, message: "Matches or gaps were not usable." };
  if (matches.length === 0 && gaps.length === 0) {
    return { ok: false, message: "The assessment did not name matches or gaps." };
  }

  const lookAt = readLookAt(record.lookAt, source);
  if (!lookAt) return { ok: false, message: "The assessment did not name 2 or 3 real entries to open." };

  return { ok: true, value: { summary, matches, gaps, lookAt } };
}

export function parseJsonObject(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const body = (fenced?.[1] ?? trimmed).trim();
  try {
    return JSON.parse(body);
  } catch {
    const start = body.indexOf("{");
    const end = body.lastIndexOf("}");
    if (start === -1 || end <= start) throw new Error("no json");
    return JSON.parse(body.slice(start, end + 1));
  }
}

function readMatches(value: unknown, source: Profile): FitMatch[] | null {
  if (!Array.isArray(value)) return null;
  const matches: FitMatch[] = [];
  for (const item of value) {
    if (matches.length >= 8) break;
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const requirement = cleanText(record.requirement, 300);
    if (!requirement) continue;
    const ids = readIds(record.sourceIds ?? record.sourceId).slice(0, 4);
    const sources: FitSource[] = [];
    for (const id of ids) {
      const entry = findEntry(source, id);
      if (!entry || sources.some((existing) => existing.id === entry.id)) continue;
      sources.push(toSource(entry));
    }
    if (sources.length === 0) continue;
    matches.push({ requirement, sources });
  }
  return matches;
}

function readGaps(value: unknown): FitGap[] | null {
  if (!Array.isArray(value)) return null;
  const gaps: FitGap[] = [];
  for (const item of value) {
    if (gaps.length >= 8) break;
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const requirement = cleanText(record.requirement, 300);
    const note = cleanText(record.note, 400);
    const partial = readPartial(record.partial);
    if (!requirement || !note || partial === null) continue;
    if (mentionsContact(note) || EMAIL.test(note)) continue;
    gaps.push({ requirement, note, partial });
  }
  return gaps;
}

function readLookAt(value: unknown, source: Profile): FitLookAt[] | null {
  if (!Array.isArray(value)) return null;
  const items: FitLookAt[] = [];
  for (const item of value) {
    if (items.length >= 3) break;
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const id = typeof record.id === "string" ? record.id.trim() : "";
    const why = cleanText(record.why, 400);
    const entry = id ? findEntry(source, id) : undefined;
    if (!entry || !why || !LOOK_AT_KINDS.has(entry.kind)) continue;
    if (mentionsContact(why) || EMAIL.test(why)) continue;
    if (items.some((existing) => existing.id === entry.id)) continue;
    items.push({
      id: entry.id,
      kind: entry.kind,
      title: entry.title,
      ...(entry.organization ? { organization: entry.organization } : {}),
      ...(entry.url ? { url: entry.url } : {}),
      why,
    });
  }
  if (items.length < 2) return null;
  return items;
}

function toSource(entry: ProfileEntry): FitSource {
  return {
    id: entry.id,
    kind: entry.kind,
    title: entry.title,
    ...(entry.organization ? { organization: entry.organization } : {}),
    ...(entry.location ? { location: entry.location } : {}),
    ...(entry.dates ? { dates: entry.dates } : {}),
    ...(entry.url ? { url: entry.url } : {}),
    highlights: [...entry.highlights],
  };
}

function readIds(value: unknown): string[] {
  if (typeof value === "string") return [value.trim()].filter(Boolean);
  if (!Array.isArray(value)) return [];
  return value.filter((id): id is string => typeof id === "string").map((id) => id.trim()).filter(Boolean);
}

function readPartial(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false" || value === undefined) return false;
  return null;
}

function cleanText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const text = value.replace(/\s+/g, " ").trim();
  if (!text || text.length > max) return null;
  return text;
}

function mentionsContact(value: string): boolean {
  return EMAIL.test(value) || PHONE.test(value);
}
