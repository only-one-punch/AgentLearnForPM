"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { TermEntry } from "../ui/workbench-data";

export function TermBrowser({ terms }: { terms: TermEntry[] }) {
  const categories = ["All", ...Array.from(new Set(terms.map((term) => term.category)))];
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const visible = useMemo(
    () =>
      terms.filter((term) => {
        const categoryMatch = category === "All" || term.category === category;
        const queryMatch = `${term.term} ${term.definition} ${term.related.join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase());
        return categoryMatch && queryMatch;
      }),
    [category, query, terms],
  );

  return (
    <section className="page-stack" aria-labelledby="terms-title">
      <div className="page-header">
        <span className="section-kicker">Terminology</span>
        <h1 id="terms-title">Terms</h1>
      </div>
      <div className="term-toolbar">
        <label>
          <span className="sr-only">Filter terms</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter terms" />
        </label>
        <div className="segmented-control" aria-label="Term categories">
          {categories.map((item) => (
            <button aria-pressed={category === item} key={item} onClick={() => setCategory(item)} type="button">
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="term-grid">
        {visible.map((term) => (
          <article className="term-card" key={term.id}>
            <small>{term.category}</small>
            <h2>{term.term}</h2>
            <p>{term.definition}</p>
            <div className="tag-row">
              {term.related.map((related) => (
                <span key={related}>{related}</span>
              ))}
            </div>
            <Link href={`/docs/${term.documentSlug}`}>Open source</Link>
          </article>
        ))}
      </div>
    </section>
  );
}
