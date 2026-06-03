import { createServerFn } from "@tanstack/react-start";
import type { SqlCounterBinding } from "@repo/persistence";

import { env } from "./cloudflare-env.ts";

const COUNTER_NAME = "default";

type SqlCounterDurableObject = SqlCounterBinding & Rpc.DurableObjectBranded;

function counter() {
  const namespace = env.SQL_COUNTER as unknown as DurableObjectNamespace<SqlCounterDurableObject>;
  return namespace.getByName(COUNTER_NAME);
}

export const getCounterCount = createServerFn({ method: "GET" }).handler(async () => ({
  count: await counter().get(COUNTER_NAME),
}));

export const incrementCounter = createServerFn({ method: "POST" }).handler(async () => ({
  count: await counter().increment(COUNTER_NAME),
}));
