"use client";

import { useState } from "react";
import type { MasteryStatus, SelfTestItem } from "../ui/workbench-data";
import { StatusPill } from "../ui/status-pill";

const options: Array<{ value: MasteryStatus; label: string }> = [
  { value: "mastered", label: "Mastered" },
  { value: "uncertain", label: "Uncertain" },
  { value: "not_yet", label: "Not yet" },
];

export function SelfTestPanel({ items }: { items: SelfTestItem[] }) {
  const [statuses, setStatuses] = useState<Record<string, MasteryStatus>>(
    Object.fromEntries(items.map((item) => [item.id, item.status])),
  );

  if (items.length === 0) {
    return (
      <section className="panel reader-study-panel" aria-label="Self test">
        <h2>Self-Test</h2>
        <p className="muted-text">No extracted self-test items for this document yet.</p>
      </section>
    );
  }

  return (
    <section className="panel reader-study-panel" aria-label="Self test">
      <h2>Self-Test</h2>
      <div className="self-test-list">
        {items.map((item) => (
          <article className="self-test-item" id={item.id} key={item.id}>
            <div className="self-test-prompt">
              <p>{item.prompt}</p>
              <StatusPill status={statuses[item.id]} />
            </div>
            <div className="segmented-control" aria-label={`Set mastery for ${item.topic}`}>
              {options.map((option) => (
                <button
                  aria-pressed={statuses[item.id] === option.value}
                  key={option.value}
                  onClick={() => setStatuses((current) => ({ ...current, [item.id]: option.value }))}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
