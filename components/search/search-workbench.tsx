"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { searchWorkbench } from "../ui/workbench-data";

export function SearchWorkbench({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const results = useMemo(() => searchWorkbench(query), [query]);

  return (
    <section className="page-stack" aria-labelledby="search-title">
      <div className="page-header">
        <span className="section-kicker">Private search</span>
        <h1 id="search-title">Search</h1>
      </div>
      <label className="search-panel">
        <span className="sr-only">Search knowledge base</span>
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="tool schema, 权限, eval"
        />
      </label>
      <div className="result-list" aria-live="polite">
        {query.trim().length < 2 ? (
          <p className="muted-text">Enter at least two characters.</p>
        ) : results.length === 0 ? (
          <p className="muted-text">No matching private results.</p>
        ) : (
          results.map((result) => (
            <Link className="result-item" href={result.href} key={result.id}>
              <small>{result.kind} · {result.documentTitle}</small>
              <strong>{result.title}</strong>
              <span>{result.snippet}</span>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
