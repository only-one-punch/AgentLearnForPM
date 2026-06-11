import type { ReactNode } from "react";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";

type MarkdownRendererProps = {
  markdown: string;
};

const processor = unified().use(remarkParse).use(remarkGfm);

function textContent(node: any): string {
  if (!node) return "";
  if (typeof node.value === "string") return node.value;
  return (node.children ?? []).map(textContent).join("");
}

function renderChildren(node: any, keyPrefix: string): ReactNode {
  return (node.children ?? []).map((child: any, index: number) => renderNode(child, `${keyPrefix}-${index}`));
}

function renderTableCell(node: any, key: string, tag: "td" | "th") {
  const Tag = tag;
  return <Tag key={key}>{renderChildren(node, key)}</Tag>;
}

function renderNode(node: any, key: string): ReactNode {
  switch (node.type) {
    case "root":
      return <>{renderChildren(node, key)}</>;
    case "paragraph":
      return <p key={key}>{renderChildren(node, key)}</p>;
    case "text":
      return node.value;
    case "strong":
      return <strong key={key}>{renderChildren(node, key)}</strong>;
    case "emphasis":
      return <em key={key}>{renderChildren(node, key)}</em>;
    case "delete":
      return <del key={key}>{renderChildren(node, key)}</del>;
    case "inlineCode":
      return <code key={key}>{node.value}</code>;
    case "break":
      return <br key={key} />;
    case "link": {
      const href = String(node.url ?? "#");
      const isExternal = /^https?:\/\//.test(href);
      return (
        <a href={href} key={key} rel={isExternal ? "noreferrer" : undefined} target={isExternal ? "_blank" : undefined}>
          {renderChildren(node, key)}
        </a>
      );
    }
    case "heading": {
      const text = textContent(node);
      if (node.depth <= 2) return <h3 key={key}>{text}</h3>;
      if (node.depth === 3) return <h4 key={key}>{text}</h4>;
      return <h5 key={key}>{text}</h5>;
    }
    case "blockquote":
      return <blockquote key={key}>{renderChildren(node, key)}</blockquote>;
    case "list": {
      const Tag = node.ordered ? "ol" : "ul";
      return <Tag key={key}>{renderChildren(node, key)}</Tag>;
    }
    case "listItem":
      return <li key={key}>{renderChildren(node, key)}</li>;
    case "code":
      return (
        <pre className="code-block" key={key}>
          <code>{node.value}</code>
        </pre>
      );
    case "thematicBreak":
      return <hr key={key} />;
    case "table": {
      const rows = node.children ?? [];
      const [head, ...body] = rows;
      return (
        <div className="table-scroll" key={key}>
          <table>
            {head ? (
              <thead>
                <tr>{(head.children ?? []).map((cell: any, index: number) => renderTableCell(cell, `${key}-h-${index}`, "th"))}</tr>
              </thead>
            ) : null}
            <tbody>
              {body.map((row: any, rowIndex: number) => (
                <tr key={`${key}-r-${rowIndex}`}>
                  {(row.children ?? []).map((cell: any, cellIndex: number) =>
                    renderTableCell(cell, `${key}-r-${rowIndex}-${cellIndex}`, "td"),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case "html":
      return null;
    default:
      return <p key={key}>{textContent(node)}</p>;
  }
}

export function MarkdownRenderer({ markdown }: MarkdownRendererProps) {
  const tree = processor.parse(markdown);
  return <>{renderNode(tree, "md")}</>;
}
