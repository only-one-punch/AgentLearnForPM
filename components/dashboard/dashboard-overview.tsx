import Link from "next/link";
import { getDashboardSnapshot } from "../ui/workbench-data";
import { StatusPill } from "../ui/status-pill";

export function DashboardOverview() {
  const snapshot = getDashboardSnapshot();

  return (
    <div className="dashboard-grid">
      <section className="panel dashboard-hero" aria-labelledby="continue-reading-title">
        <div>
          <span className="section-kicker">Continue reading</span>
          <h1 id="continue-reading-title">{snapshot.continueReading.title}</h1>
          <p>{snapshot.continueReading.subtitle}</p>
        </div>
        <div className="hero-progress" aria-label={`${snapshot.continueReading.completedPercent}% complete`}>
          <span>{snapshot.continueReading.completedPercent}%</span>
        </div>
        <Link className="primary-link" href={`/docs/${snapshot.continueReading.slug}`}>
          Open reader
        </Link>
      </section>

      <section className="metric-strip" aria-label="Study summary">
        <div>
          <strong>{snapshot.totals.documents}</strong>
          <span>Docs</span>
        </div>
        <div>
          <strong>{snapshot.totals.completed}</strong>
          <span>Done</span>
        </div>
        <div>
          <strong>{snapshot.totals.weak}</strong>
          <span>Weak</span>
        </div>
        <div>
          <strong>{snapshot.totals.bookmarked}</strong>
          <span>Saved</span>
        </div>
      </section>

      <section className="panel" aria-labelledby="unfinished-title">
        <div className="panel-heading">
          <h2 id="unfinished-title">Unfinished Modules</h2>
          <Link href="/library">All docs</Link>
        </div>
        <div className="stack-list">
          {snapshot.unfinished.map((document) => (
            <Link className="stack-item" href={`/docs/${document.slug}`} key={document.slug}>
              <span>{document.title}</span>
              <small>{document.completedPercent}%</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="panel" aria-labelledby="weak-title">
        <div className="panel-heading">
          <h2 id="weak-title">Weak Points</h2>
          <Link href="/review">Review</Link>
        </div>
        <div className="stack-list">
          {snapshot.weakItems.slice(0, 3).map((item) => (
            <Link className="stack-item stack-item--tall" href={`/review#${item.id}`} key={item.id}>
              <span>{item.prompt}</span>
              <StatusPill status={item.status} />
            </Link>
          ))}
        </div>
      </section>

      <section className="panel dashboard-wide" aria-labelledby="recent-title">
        <div className="panel-heading">
          <h2 id="recent-title">Recent Bookmarks And Notes</h2>
          <Link href="/bookmarks">Open saved</Link>
        </div>
        <div className="saved-row">
          {snapshot.recentSaved.map((item) => (
            <Link className="saved-item" href={`/docs/${item.documentSlug}#${item.sectionId}`} key={item.id}>
              <small>{item.kind === "note" ? "Note" : "Bookmark"} · {item.documentTitle}</small>
              <span>{item.excerpt}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
