import Link from "next/link";
import { SelfTestPanel } from "../self-test/self-test-panel";
import type { ReaderBlock, SelfTestItem } from "../ui/workbench-data";
import { ReaderActions } from "./reader-actions";

type ReaderProps = {
  document: {
    slug: string;
    title: string;
    subtitle: string;
    completedPercent: number;
    sections: Array<{
      id: string;
      title: string;
      depth: 2 | 3;
      blocks: ReaderBlock[];
    }>;
    selfTests: SelfTestItem[];
  };
};

function BlockRenderer({ block }: { block: ReaderBlock }) {
  if (block.type === "paragraph") return <p>{block.text}</p>;
  if (block.type === "quote") return <blockquote>{block.text}</blockquote>;
  if (block.type === "code") {
    return (
      <pre className="code-block">
        <code>{block.code}</code>
      </pre>
    );
  }
  if (block.type === "mermaid") {
    return (
      <figure className="mermaid-fallback">
        <figcaption>Mermaid</figcaption>
        <pre>
          <code>{block.code}</code>
        </pre>
      </figure>
    );
  }
  return null;
}

export function DocumentReader({ document }: ReaderProps) {
  return (
    <div className="reader-layout">
      <aside className="reader-toc" aria-label="Table of contents">
        <div className="toc-progress">
          <span>{document.completedPercent}%</span>
          <small>Progress</small>
        </div>
        <nav>
          {document.sections.map((section) => (
            <Link className={`toc-depth-${section.depth}`} href={`#${section.id}`} key={section.id}>
              {section.title}
            </Link>
          ))}
        </nav>
      </aside>

      <article className="reader-article">
        <header className="reader-header">
          <span className="section-kicker">Reader</span>
          <h1>{document.title}</h1>
          <p>{document.subtitle}</p>
        </header>
        {document.sections.map((section) => (
          <section className="reader-section" id={section.id} key={section.id}>
            <div className="reader-section-heading">
              <h2>{section.title}</h2>
              <ReaderActions sectionId={section.id} />
            </div>
            {section.blocks.map((block, index) => (
              <BlockRenderer block={block} key={`${section.id}-${index}`} />
            ))}
          </section>
        ))}
      </article>

      <aside className="reader-rail" aria-label="Study rail">
        <SelfTestPanel items={document.selfTests} />
        <section className="panel reader-study-panel">
          <h2>Source</h2>
          <p className="muted-text">Generated content contract pending backend integration.</p>
        </section>
      </aside>
    </div>
  );
}
