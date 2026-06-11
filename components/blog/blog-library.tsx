import Link from "next/link";
import { getBlogDocuments, getCategoryCounts } from "./blog-data";

const categories = ["全部文章", "基础概念", "核心架构", "上线质量", "产品表达"] as const;

export function BlogLibrary() {
  const documents = getBlogDocuments();
  const counts = getCategoryCounts();

  return (
    <main className="blog-page" id="main-content">
      <section className="library-header" aria-labelledby="library-title">
        <span className="eyebrow">Library</span>
        <h1 id="library-title">全部文档</h1>
        <p>当前资料共 {documents.length} 篇，按原始 Markdown 编号排序。第一版只做清晰阅读，不做复杂学习功能。</p>
      </section>

      <section className="library-layout" aria-label="文章列表">
        <nav className="category-rail" aria-label="主题分类">
          {categories.map((category, index) => (
            <a href="#article-list" aria-current={index === 0 ? "true" : undefined} key={category}>
              <span>{category}</span>
              <strong>{counts[category]}</strong>
            </a>
          ))}
        </nav>

        <div className="post-grid post-grid-full" id="article-list">
          {documents.map((document) => (
            <Link className="post-card" href={`/docs/${document.slug}`} key={document.slug}>
              <span className="post-number">{String(document.order - 1).padStart(2, "0")}</span>
              <h2>{document.title}</h2>
              <p>{document.summary}</p>
              <span className="post-meta">
                <span>{document.category}</span>
                <span>{document.sectionCount} 个章节</span>
                <span>{document.updatedAt}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
