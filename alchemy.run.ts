import { fileURLToPath } from "node:url";

import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";

import { SqlCounter } from "./packages/persistence/src/do/SqlCounter.ts";
import ApiLive, { ApiWorker } from "./apps/api/src/Worker.ts";

export const Admin = Cloudflare.Vite(
  "Admin",
  Effect.gen(function* () {
    const api = yield* ApiWorker;

    return {
      rootDir: fileURLToPath(new URL("./apps/admin", import.meta.url)),
      compatibility: {
        date: "2026-06-02",
        flags: ["nodejs_compat"],
      },
      env: {
        SQL_COUNTER: Cloudflare.DurableObjectNamespace<SqlCounter>("SqlCounter", {
          scriptName: api.workerName,
        }),
      },
      dev: {
        port: 4000,
      },
    };
  }),
);

export type AdminEnv = Cloudflare.InferEnv<typeof Admin>;

export default Alchemy.Stack(
  "Bug",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const api = yield* ApiWorker;
    const admin = yield* Admin;

    return {
      apiUrl: api.url.as<string>(),
      adminUrl: admin.url.as<string>(),
    };
  }).pipe(Effect.provide(ApiLive)),
);
