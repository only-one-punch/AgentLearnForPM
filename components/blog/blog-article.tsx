import Link from "next/link";
import type { BlogArticle as BlogArticleType, BlogBlock } from "./blog-data";
import { MarkdownRenderer } from "./markdown-renderer";

type BlogArticleProps = {
  article: BlogArticleType;
};

function BlockRenderer({ block }: { block: BlogBlock }) {
  if (block.type === "mermaid") {
    return (
      <figure className="mermaid-card">
        <figcaption>Mermaid 图表源码</figcaption>
        <pre>
          <code>{block.code}</code>
        </pre>
      </figure>
    );
  }

  return <MarkdownRenderer markdown={block.markdown} />;
}

export function BlogArticle({ article }: BlogArticleProps) {
  const tocSections = article.sections.filter((section, index) => index > 0 && section.level <= 3);

  return (
    <main className="article-shell" id="main-content">
      <aside className="article-toc" aria-label="文章目录">
        <strong>文章目录</strong>
        <nav>
          {tocSections.slice(0, 28).map((section) => (
            <a className={section.level > 2 ? "toc-child" : undefined} href={`#${section.id}`} key={section.id}>
              {section.title}
            </a>
          ))}
        </nav>
      </aside>

      <article className="article-body">
        <header className="article-header">
          <Link className="back-link" href="/library">
            返回全部文章
          </Link>
          <span className="article-kicker">{String(article.order - 1).padStart(2, "0")} / {article.category}</span>
          <h1>{article.title}</h1>
          <p>{article.summary}</p>
          <dl className="source-strip">
            <div>
              <dt>Source</dt>
              <dd>{article.sourcePath}</dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd>{article.updatedAt}</dd>
            </div>
          </dl>
        </header>

        {article.sections.map((section, index) => {
          const showHeading = index > 0;
          return (
            <section className="article-section" id={section.id} key={section.id}>
              {showHeading ? (section.level <= 2 ? <h2>{section.title}</h2> : <h3>{section.title}</h3>) : null}
              {section.blocks.map((block, blockIndex) => (
                <BlockRenderer block={block} key={`${section.id}-${blockIndex}`} />
              ))}
            </section>
          );
        })}

        <nav className="article-pager" aria-label="文章翻页">
          {article.previous ? (
            <Link href={`/docs/${article.previous.slug}`}>
              <small>上一篇</small>
              <span>{article.previous.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {article.next ? (
            <Link href={`/docs/${article.next.slug}`}>
              <small>下一篇</small>
              <span>{article.next.title}</span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </article>
    </main>
  );
}
