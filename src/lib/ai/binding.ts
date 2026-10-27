import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { WorkersAiBinding } from "./instruct";

declare global {
  interface CloudflareEnv {
    AI?: WorkersAiBinding;
  }
}

/** Null when the Workers AI binding is missing, including plain `next dev`. */
export function getWorkersAi(): WorkersAiBinding | null {
  try {
    const ai = getCloudflareContext().env.AI;
    if (!ai || typeof ai.run !== "function") return null;
    return ai;
  } catch {
    return null;
  }
}
