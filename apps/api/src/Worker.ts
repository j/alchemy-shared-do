import * as Cloudflare from "alchemy/Cloudflare";
import { Layer } from "effect";
import * as Effect from "effect/Effect";
import * as Etag from "effect/unstable/http/Etag";
import * as HttpPlatform from "effect/unstable/http/HttpPlatform";
import * as HttpRouter from "effect/unstable/http/HttpRouter";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";
import * as HttpApiBuilder from "effect/unstable/httpapi/HttpApiBuilder";

import SqlCounterLive, { SqlCounter } from "@repo/persistence/do/SqlCounter";

import { Api } from "./Spec.ts";

const HealthGroupLive = HttpApiBuilder.group(Api, "Health", (handlers) =>
  handlers.handle("health", () => Effect.succeed("ok")),
);

export class ApiWorker extends Cloudflare.Worker<ApiWorker, {}, SqlCounter>()("Api", {
  main: import.meta.filename,
  compatibility: {
    date: "2026-06-02",
    flags: ["nodejs_compat"],
  },
}) {}

export default ApiWorker.make(
  Effect.gen(function* () {
    const counter = yield* SqlCounter;

    const CounterGroupLive = HttpApiBuilder.group(Api, "Counter", (handlers) =>
      handlers.handle("counterIncrement", (ctx) =>
        counter.getByName(ctx.params.name).increment(ctx.params.name).pipe(Effect.orDie),
      ),
    );

    const ApiLive = HttpApiBuilder.layer(Api).pipe(
      Layer.provide(HealthGroupLive),
      Layer.provide(CounterGroupLive),
      Layer.provide([HttpPlatform.layer, Etag.layer]),
    );

    return {
      fetch: HttpRouter.toHttpEffect(ApiLive).pipe(
        Effect.map(
          Effect.catchTag("HttpServerError", (error) =>
            error.reason._tag === "RouteNotFound"
              ? Effect.succeed(HttpServerResponse.text("Not Found", { status: 404 }))
              : Effect.fail(error),
          ),
        ),
      ),
    };
  }).pipe(Effect.provide(SqlCounterLive)),
);
