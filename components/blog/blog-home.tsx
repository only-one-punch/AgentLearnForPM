import Link from "next/link";
import { getBlogDocuments, getContentUpdatedAt, getFeaturedDocuments, getReadingPath } from "./blog-data";

export function BlogHome() {
  const documents = getBlogDocuments();
  const featured = getFeaturedDocuments();
  const readingPath = getReadingPath();

  return (
    <main className="blog-page" id="main-content">
      <section className="hero-section" aria-labelledby="site-title">
        <div className="hero-copy">
          <span className="eyebrow">Agent PM Technical Notes</span>
          <h1 id="site-title">Agent PM 技术资料，整理成可阅读的网页手册。</h1>
          <p>
            从 LLM 基础、Agent 架构、Tool Calling、RAG、Memory 到 Eval、安全与产品化，
            这里保留完整资料、推荐阅读顺序和适合长文阅读的排版。
          </p>
          <div className="hero-meta" aria-label="站点概览">
            <span>
              <i className="dot dot-red" />
              {documents.length} 篇文档
            </span>
            <span>
              <i className="dot dot-blue" />
              推荐阅读顺序
            </span>
            <span>
              <i className="dot dot-gold" />
              更新于 {getContentUpdatedAt()}
            </span>
          </div>
        </div>

        <aside className="start-panel" aria-labelledby="start-title">
          <span className="eyebrow">Start Here</span>
          <h2 id="start-title">推荐从技术知识总览开始</h2>
          <p>先建立全局语言，再进入 Tool Calling、RAG、Eval 和安全合规这些高区分度主题。</p>
          <div className="start-list">
            {featured.map((document) => (
              <Link className="start-item" href={`/docs/${document.slug}`} key={document.slug}>
                <strong>{String(document.order - 1).padStart(2, "0")}</strong>
                <span>
                  {document.title}
                  <small>{document.summary}</small>
                </span>
              </Link>
            ))}
          </div>
        </aside>
      </section>

      <section className="site-section" aria-labelledby="path-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Reading Path</span>
            <h2 id="path-title">推荐阅读路径</h2>
            <p>保留原始编号顺序，但把第一轮阅读压成清晰的主题阶段。</p>
          </div>
          <Link className="text-link" href="/library">
            查看全部文章
          </Link>
        </div>

        <div className="reading-path">
          {readingPath.map((step) => (
            <Link className="path-step" href={`/docs/${step.documents[0]?.slug ?? documents[0].slug}`} key={step.step}>
              <small>{step.step}</small>
              <h3>{step.title}</h3>
              <p>{step.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="site-section" aria-labelledby="latest-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Library</span>
            <h2 id="latest-title">全部文档</h2>
            <p>按现有 Markdown 编号展示。每篇文章都保留源文档结构，后续新增文档也能进入列表。</p>
          </div>
          <Link className="text-link" href="/library">
            进入文章列表
          </Link>
        </div>

        <div className="post-grid">
          {documents.slice(0, 8).map((document) => (
            <Link className="post-card" href={`/docs/${document.slug}`} key={document.slug}>
              <span className="post-number">{String(document.order - 1).padStart(2, "0")}</span>
              <h3>{document.title}</h3>
              <p>{document.summary}</p>
              <span className="post-meta">
                <span>{document.category}</span>
                <span>{document.sectionCount} 个章节</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
