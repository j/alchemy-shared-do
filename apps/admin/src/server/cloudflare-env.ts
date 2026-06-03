import { env as cloudflareEnv } from "cloudflare:workers";

import type { AdminEnv } from "../../../../alchemy.run.ts";

export const env = new Proxy({} as AdminEnv, {
  get(_target, property) {
    if (typeof property === "symbol") return undefined;
    return cloudflareEnv[property as keyof typeof cloudflareEnv];
  },
});
