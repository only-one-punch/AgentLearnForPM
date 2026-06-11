import Link from "next/link";
import { getBookmarkNotes } from "../../../components/ui/workbench-data";

export default function BookmarksPage() {
  const saved = getBookmarkNotes();

  return (
    <section className="page-stack" aria-labelledby="bookmarks-title">
      <div className="page-header">
        <span className="section-kicker">Saved material</span>
        <h1 id="bookmarks-title">Bookmarks And Notes</h1>
      </div>
      <div className="saved-list">
        {saved.map((item) => (
          <article className="panel saved-detail" key={item.id}>
            <div>
              <small>{item.kind} · {item.updatedAt}</small>
              <h2>{item.sectionTitle}</h2>
              <p>{item.excerpt}</p>
              {item.note ? <blockquote>{item.note}</blockquote> : null}
            </div>
            <Link href={`/docs/${item.documentSlug}#${item.sectionId}`}>{item.documentTitle}</Link>
          </article>
        ))}
      </div>
    </section>
  );
}
