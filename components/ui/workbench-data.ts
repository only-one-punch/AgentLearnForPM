import contentVersionArtifact from "../../.generated/knowledge/content-version.json";
import documentsArtifact from "../../.generated/knowledge/documents.json";
import searchArtifact from "../../.generated/knowledge/search.json";
import sectionsArtifact from "../../.generated/knowledge/sections.json";
import selfTestsArtifact from "../../.generated/knowledge/self-tests.json";
import termsArtifact from "../../.generated/knowledge/terms.json";

export type MasteryStatus = "mastered" | "uncertain" | "not_yet";

export type KnowledgeDocument = {
  slug: string;
  order: number;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  completedPercent: number;
  sectionCount: number;
  weakCount: number;
  lastReadSection?: string;
};

export type ReaderBlock =
  | { type: "paragraph"; text: string }
  | { type: "code"; language: string; code: string }
  | { type: "mermaid"; code: string }
  | { type: "quote"; text: string };

export type ReaderSection = {
  id: string;
  title: string;
  depth: 2 | 3;
  blocks: ReaderBlock[];
};

export type SelfTestItem = {
  id: string;
  documentSlug: string;
  documentTitle: string;
  prompt: string;
  status: MasteryStatus;
  topic: string;
};

export type TermEntry = {
  id: string;
  term: string;
  category: string;
  definition: string;
  related: string[];
  documentSlug: string;
};

export type BookmarkNote = {
  id: string;
  kind: "bookmark" | "note";
  documentSlug: string;
  documentTitle: string;
  sectionId: string;
  sectionTitle: string;
  excerpt: string;
  note?: string;
  updatedAt: string;
};

export type SearchResult = {
  id: string;
  title: string;
  documentTitle: string;
  href: string;
  snippet: string;
  kind: "section" | "term" | "self-test";
};

export type ContentVersion = {
  gitSha: string;
  contentHash: string;
  generatedAt: string;
  documentCount: number;
  refreshStatus: "current" | "stale" | "failed";
};

type ArtifactDocument = {
  slug: string;
  order: number;
  title: string;
  summary: string;
  sectionCount: number;
};

type ArtifactBlock =
  | { type: "markdown"; markdown: string; text: string }
  | { type: "mermaid"; code: string; text: string };

type ArtifactSection = {
  id: string;
  documentSlug: string;
  title: string;
  level: number;
  excerpt: string;
  blocks: ArtifactBlock[];
};

type ArtifactSelfTest = {
  id: string;
  documentSlug: string;
  documentTitle: string;
  prompt: string;
};

type ArtifactTerm = {
  id: string;
  term: string;
  category: string;
  aliases: string[];
  definition: string;
  pmNotes: string;
  sourceDocumentSlug: string;
};

type ArtifactSearchRecord = {
  id: string;
  type: "section" | "term" | "self_test";
  title: string;
  documentTitle: string;
  body: string;
  keywords: string[];
  href: string;
};

const documents = (documentsArtifact as ArtifactDocument[])
  .map(toKnowledgeDocument)
  .sort((a, b) => a.order - b.order);

const selfTestItems = (selfTestsArtifact as ArtifactSelfTest[]).map(toSelfTestItem);
const termEntries = (termsArtifact as ArtifactTerm[]).map(toTermEntry);

export const bookmarkNotes: BookmarkNote[] = documents.slice(0, 2).map((document, index) => {
  const section = firstSectionForDocument(document.slug);
  return {
    id: `sample-saved-${document.slug}`,
    kind: index === 0 ? "bookmark" : "note",
    documentSlug: document.slug,
    documentTitle: document.title,
    sectionId: section?.id ?? document.slug,
    sectionTitle: section?.title ?? document.title,
    excerpt: section?.excerpt ?? document.subtitle,
    note: index === 1 ? "上线后这里会保存你的真实笔记。" : undefined,
    updatedAt: "2026-06-05 00:00",
  };
});

function stripMarkdown(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[#>*_|~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function shortText(value: string, limit = 96) {
  const text = stripMarkdown(value);
  if (text.length <= limit) return text;
  return `${text.slice(0, limit)}...`;
}

function toKnowledgeDocument(document: ArtifactDocument): KnowledgeDocument {
  const weakCount = selfTestsArtifact.filter((item) => item.documentSlug === document.slug).length;
  return {
    slug: document.slug,
    order: document.order,
    title: document.title,
    subtitle: shortText(document.summary, 88),
    estimatedMinutes: Math.max(12, Math.ceil(document.sectionCount * 0.8)),
    completedPercent: document.slug === "04-tool-calling" ? 52 : 0,
    sectionCount: document.sectionCount,
    weakCount,
    lastReadSection: firstSectionForDocument(document.slug)?.title,
  };
}

function toReaderSection(section: ArtifactSection): ReaderSection {
  return {
    id: section.id,
    title: section.title,
    depth: section.level <= 2 ? 2 : 3,
    blocks: section.blocks.map((block): ReaderBlock => {
      if (block.type === "mermaid") {
        return { type: "mermaid", code: block.code };
      }
      if (block.markdown.trim().startsWith(">")) {
        return { type: "quote", text: block.text };
      }
      if (block.markdown.trim().startsWith("```")) {
        return { type: "code", language: "", code: block.markdown.replace(/^```[^\n]*\n?|\n?```$/g, "") };
      }
      return { type: "paragraph", text: block.text || shortText(block.markdown, 1200) };
    }),
  };
}

function toSelfTestItem(item: ArtifactSelfTest): SelfTestItem {
  const topic = item.documentTitle.replace(/^\d+\.\s*/, "");
  return {
    id: item.id,
    documentSlug: item.documentSlug,
    documentTitle: item.documentTitle,
    prompt: item.prompt,
    status: "not_yet",
    topic,
  };
}

function toTermEntry(term: ArtifactTerm): TermEntry {
  return {
    id: term.id,
    term: term.term,
    category: term.category || "General",
    definition: term.pmNotes ? `${term.definition} ${term.pmNotes}` : term.definition,
    related: term.aliases,
    documentSlug: term.sourceDocumentSlug,
  };
}

function firstSectionForDocument(slug: string) {
  return (sectionsArtifact as ArtifactSection[]).find((section) => section.documentSlug === slug);
}

function bySlug(slug: string) {
  return documents.find((document) => document.slug === slug);
}

export function getDocuments() {
  return documents;
}

export function getDocumentBySlug(slug: string) {
  const document = bySlug(slug) ?? documents[0];
  return {
    ...document,
    sections: (sectionsArtifact as ArtifactSection[])
      .filter((section) => section.documentSlug === document.slug)
      .map(toReaderSection),
    selfTests: selfTestItems.filter((item) => item.documentSlug === document.slug),
  };
}

export function getDashboardSnapshot() {
  const continueReading = documents.find((item) => item.slug === "04-tool-calling") ?? documents[0];
  const weakItems = getWeakItems();
  return {
    continueReading,
    unfinished: documents.slice(0, 5),
    weakItems,
    recentSaved: bookmarkNotes,
    totals: {
      documents: documents.length,
      completed: 0,
      weak: weakItems.length,
      bookmarked: bookmarkNotes.length,
    },
  };
}

export function getWeakItems() {
  return selfTestItems.slice(0, 24);
}

export function getBookmarkNotes() {
  return bookmarkNotes;
}

export function getTerms() {
  return termEntries;
}

export function searchWorkbench(query: string): SearchResult[] {
  const normalized = query.trim().toLowerCase();
  if (normalized.length < 2) return [];

  return (searchArtifact as ArtifactSearchRecord[])
    .filter((record) =>
      [record.title, record.documentTitle, record.body, record.keywords.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    )
    .slice(0, 12)
    .map<SearchResult>((record) => ({
      id: record.id,
      title: record.title,
      documentTitle: record.documentTitle,
      href: record.href,
      snippet: shortText(record.body, 180),
      kind: record.type === "self_test" ? "self-test" : record.type,
    }));
}

export function getContentVersion(): ContentVersion {
  return {
    gitSha: contentVersionArtifact.gitSha ?? "local",
    contentHash: contentVersionArtifact.contentHash,
    generatedAt: contentVersionArtifact.generatedAt,
    documentCount: contentVersionArtifact.documentCount,
    refreshStatus: "current",
  };
}

export function buildReaderProgressLabel(percent: number) {
  if (percent <= 0) return "未开始";
  if (percent >= 100) return "已完成";
  return `${percent}%`;
}
