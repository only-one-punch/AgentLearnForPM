import contentVersionArtifact from "../../.generated/knowledge/content-version.json";
import documentsArtifact from "../../.generated/knowledge/documents.json";
import sectionsArtifact from "../../.generated/knowledge/sections.json";

export type BlogCategory = "基础概念" | "核心架构" | "上线质量" | "产品表达";

export type BlogDocument = {
  slug: string;
  order: number;
  title: string;
  summary: string;
  sourcePath: string;
  sectionCount: number;
  category: BlogCategory;
  updatedAt: string;
};

export type BlogBlock =
  | { type: "markdown"; markdown: string; text: string }
  | { type: "mermaid"; code: string; text: string };

export type BlogSection = {
  id: string;
  title: string;
  level: number;
  excerpt: string;
  blocks: BlogBlock[];
};

export type BlogArticle = BlogDocument & {
  sections: BlogSection[];
  previous?: BlogDocument;
  next?: BlogDocument;
};

type ArtifactDocument = {
  slug: string;
  order: number;
  title: string;
  summary: string;
  sourcePath: string;
  sectionCount: number;
};

type ArtifactSection = {
  id: string;
  documentSlug: string;
  title: string;
  level: number;
  excerpt: string;
  blocks: BlogBlock[];
};

const detectedContentDate = detectContentDate(documentsArtifact as ArtifactDocument[]);
const updatedAt = detectedContentDate ?? formatDate(contentVersionArtifact.generatedAt ?? "") ?? "2026-06-04";

const documents = (documentsArtifact as ArtifactDocument[])
  .map((document): BlogDocument => ({
    slug: document.slug,
    order: document.order,
    title: normalizeTitle(document.title),
    summary: excerpt(document.summary, 118),
    sourcePath: document.sourcePath,
    sectionCount: document.sectionCount,
    category: categoryForOrder(document.order),
    updatedAt,
  }))
  .sort((a, b) => a.order - b.order);

function normalizeTitle(title: string) {
  return title.replace(/^(\d+)[-.]\s*/, "$1. ").replace(/\s+/g, " ").trim();
}

export function stripMarkdown(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[#>*_|~`-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function excerpt(value: string, limit = 120) {
  const text = stripMarkdown(value);
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1).trim()}…`;
}

export function categoryForOrder(order: number): BlogCategory {
  if (order <= 3) return "基础概念";
  if (order <= 9) return "核心架构";
  if (order <= 12) return "上线质量";
  return "产品表达";
}

function detectContentDate(artifactDocuments: ArtifactDocument[]) {
  for (const document of artifactDocuments) {
    const match = document.summary.match(/20\d{2}-\d{2}-\d{2}/);
    if (match) return match[0];
  }
  return null;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date.getUTCFullYear() < 2020) return null;
  return date.toISOString().slice(0, 10);
}

export function getBlogDocuments() {
  return documents;
}

export function getFeaturedDocuments() {
  const preferred = ["00-agent-pm-overview", "04-tool-calling", "09-eval"];
  return preferred.map((slug) => documents.find((document) => document.slug === slug)).filter(Boolean) as BlogDocument[];
}

export function getReadingPath() {
  return [
    {
      step: "STEP 01",
      title: "全局理解",
      summary: "先看总览、LLM 基础和 Agent 基础，建立共同语言。",
      documents: documents.slice(0, 3),
    },
    {
      step: "STEP 02",
      title: "架构与工具",
      summary: "进入 Agent 架构、Tool Calling、RAG 与 Memory。",
      documents: documents.slice(3, 6),
    },
    {
      step: "STEP 03",
      title: "编排与协作",
      summary: "理解 Workflow、自动化和 Multi-Agent 的边界。",
      documents: documents.slice(6, 9),
    },
    {
      step: "STEP 04",
      title: "上线质量",
      summary: "关注 Eval、稳定性、成本、安全权限与合规。",
      documents: documents.slice(9, 12),
    },
    {
      step: "STEP 05",
      title: "产品表达",
      summary: "回到产品化方法、技术面试题和设计题框架。",
      documents: documents.slice(12),
    },
  ];
}

export function getCategoryCounts() {
  return documents.reduce<Record<BlogCategory | "全部文章", number>>(
    (counts, document) => {
      counts["全部文章"] += 1;
      counts[document.category] += 1;
      return counts;
    },
    {
      全部文章: 0,
      基础概念: 0,
      核心架构: 0,
      上线质量: 0,
      产品表达: 0,
    },
  );
}

export function getBlogArticle(slug: string): BlogArticle {
  const index = documents.findIndex((document) => document.slug === slug);
  const document = index >= 0 ? documents[index] : documents[0];
  const sections = (sectionsArtifact as ArtifactSection[])
    .filter((section) => section.documentSlug === document.slug)
    .map((section) => ({
      id: section.id,
      title: section.title,
      level: section.level,
      excerpt: section.excerpt,
      blocks: section.blocks,
    }));

  return {
    ...document,
    sections,
    previous: index > 0 ? documents[index - 1] : undefined,
    next: index >= 0 && index < documents.length - 1 ? documents[index + 1] : undefined,
  };
}

export function getContentUpdatedAt() {
  return updatedAt;
}
