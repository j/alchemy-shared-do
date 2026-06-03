import { SqliteClient } from "@effect/sql-sqlite-do";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import * as SqlClient from "effect/unstable/sql/SqlClient";
import * as SqlSchema from "effect/unstable/sql/SqlSchema";

const CounterPersistence = Schema.Struct({ value: Schema.Number });

export interface SqlCounterBinding {
  get(name: string): number;
  increment(name: string): number;
}

export interface SqlCounterShape {
  get(name: string): Effect.Effect<number>;
  increment(name: string): Effect.Effect<number>;
}

export class SqlCounter extends Cloudflare.DurableObjectNamespace<SqlCounter, SqlCounterShape>()(
  "SqlCounter",
) {}

export default SqlCounter.make(
  Effect.succeed(
    Effect.gen(function* () {
      const state = yield* Cloudflare.DurableObjectState;
      const SqlLive = SqliteClient.layer({ db: state.storage.sql.raw });

      yield* Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;

        yield* sql`
          CREATE TABLE IF NOT EXISTS counters (
            name TEXT PRIMARY KEY,
            value INTEGER NOT NULL DEFAULT 0
          )
        `;
      }).pipe(Effect.provide(SqlLive), Effect.orDie);

      const incrementCounterPersistence = SqlSchema.findOne({
        Request: Schema.String,
        Result: CounterPersistence,
        execute: (name) =>
          Effect.gen(function* () {
            const sql = yield* SqlClient.SqlClient;

            return yield* sql`
              INSERT INTO counters (name, value) VALUES (${name}, 1)
              ON CONFLICT(name) DO UPDATE SET value = value + 1
              RETURNING value
            `;
          }),
      });

      const getCounterPersistence = SqlSchema.findOne({
        Request: Schema.String,
        Result: CounterPersistence,
        execute: (name) =>
          Effect.gen(function* () {
            const sql = yield* SqlClient.SqlClient;

            return yield* sql`
              SELECT COALESCE(
                (SELECT value FROM counters WHERE name = ${name}), 0
              ) AS value
            `;
          }),
      });

      return {
        increment: (name: string) =>
          incrementCounterPersistence(name).pipe(
            Effect.map((row) => row.value),
            Effect.provide(SqlLive),
            Effect.orDie,
          ),
        get: (name: string) =>
          getCounterPersistence(name).pipe(
            Effect.map((row) => row.value),
            Effect.provide(SqlLive),
            Effect.orDie,
          ),
      };
    }),
  ),
);
