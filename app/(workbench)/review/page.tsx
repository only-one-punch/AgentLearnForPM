import Link from "next/link";
import { StatusPill } from "../../../components/ui/status-pill";
import { getWeakItems } from "../../../components/ui/workbench-data";

export default function ReviewPage() {
  const weakItems = getWeakItems();

  return (
    <section className="page-stack" aria-labelledby="review-title">
      <div className="page-header">
        <span className="section-kicker">Weak-point loop</span>
        <h1 id="review-title">Review</h1>
      </div>
      <div className="review-list">
        {weakItems.map((item) => (
          <article className="panel review-item" id={item.id} key={item.id}>
            <div>
              <small>{item.documentTitle} · {item.topic}</small>
              <h2>{item.prompt}</h2>
            </div>
            <StatusPill status={item.status} />
            <Link href={`/docs/${item.documentSlug}`}>Open document</Link>
          </article>
        ))}
      </div>
    </section>
  );
}
