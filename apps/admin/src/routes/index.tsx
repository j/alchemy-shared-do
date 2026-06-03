import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/button";
import { getCounterCount, incrementCounter } from "#/server/counter";

export const Route = createFileRoute("/")({
  loader: async () => {
    return { counter: await getCounterCount() };
  },
  head: () => ({
    meta: [{ title: "Dashboard" }],
  }),
  component: Home,
});

function Home() {
  const loaderData = Route.useLoaderData();

  return <Dashboard initialCount={loaderData.counter.count} />;
}

function Dashboard({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount);
  const [incrementing, setIncrementing] = useState(false);

  async function handleIncrement() {
    setIncrementing(true);
    try {
      const counter = await incrementCounter();
      setCount(counter.count);
    } finally {
      setIncrementing(false);
    }
  }

  return (
    <main className="px-6 py-6">
      <h1 className="text-xl font-semibold tracking-tight text-ink">Dashboard</h1>
      <span className="mt-2 block text-sm text-ink-muted">
        DO count: <span className="font-mono font-medium text-ink">{count}</span>
      </span>
      <Button onClick={handleIncrement} loading={incrementing} className="mt-5">
        <Plus aria-hidden className="size-4" />
        Increment
      </Button>
    </main>
  );
}
