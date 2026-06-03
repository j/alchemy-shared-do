import * as Schema from "effect/Schema";
import * as HttpApi from "effect/unstable/httpapi/HttpApi";
import * as HttpApiEndpoint from "effect/unstable/httpapi/HttpApiEndpoint";
import * as HttpApiGroup from "effect/unstable/httpapi/HttpApiGroup";

export const health = HttpApiEndpoint.get("health", "/api/health", {
  success: Schema.String,
});

export class HealthGroup extends HttpApiGroup.make("Health").add(health) {}

export const counterIncrement = HttpApiEndpoint.get("counterIncrement", "/api/counter/:name", {
  params: { name: Schema.String },
  success: Schema.Number,
});

export class CounterGroup extends HttpApiGroup.make("Counter").add(counterIncrement) {}

export class Api extends HttpApi.make("Api").add(HealthGroup).add(CounterGroup) {}
