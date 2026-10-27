/** Shared Workers AI instruct helper. The fit checker uses it; a later chat can too. */

export const WORKERS_AI_INSTRUCT_MODEL = "@cf/meta/llama-3.2-3b-instruct";

/** Hard ceiling so callers cannot request a huge completion. */
export const INSTRUCT_OUTPUT_TOKEN_CAP = 1024;

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type WorkersAiBinding = {
  run(model: string, input: Record<string, unknown>): Promise<unknown>;
};

export type InstructOptions = {
  maxTokens: number;
  temperature: number;
  /** Ask the model for one JSON object. Omit for free-form answers. */
  json?: boolean;
};

export function buildInstructInput(messages: ChatMessage[], options: InstructOptions) {
  const maxTokens = Math.min(INSTRUCT_OUTPUT_TOKEN_CAP, Math.max(1, Math.floor(options.maxTokens)));
  const temperature = Math.min(1, Math.max(0, options.temperature));
  return {
    messages,
    max_tokens: maxTokens,
    temperature,
    ...(options.json ? { response_format: { type: "json_object" as const } } : {}),
  };
}

export function extractModelText(result: unknown): string | null {
  const value = unwrapModelPayload(result);
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
  if (value && typeof value === "object") return JSON.stringify(value);
  return null;
}

function unwrapModelPayload(result: unknown): unknown {
  if (!result || typeof result !== "object") return result;
  const record = result as Record<string, unknown>;
  if ("response" in record) return record.response;
  if (record.result && typeof record.result === "object" && "response" in record.result) {
    return (record.result as Record<string, unknown>).response;
  }
  if ("summary" in record && "matches" in record && "lookAt" in record) return record;
  return result;
}
