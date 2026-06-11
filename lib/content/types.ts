export type ContentBlock =
  | {
      type: "markdown";
      markdown: string;
      text: string;
    }
  | {
      type: "mermaid";
      code: string;
      text: string;
    };

export type KnowledgeDocument = {
  slug: string;
  sourcePath: string;
  title: string;
  order: number;
  summary: string;
  updatedAt?: string;
  headingCount: number;
  sectionCount: number;
  selfTestCount: number;
  termCount: number;
  contentHash: string;
};

export type KnowledgeSection = {
  id: string;
  documentSlug: string;
  documentTitle: string;
  sourcePath: string;
  order: number;
  level: number;
  title: string;
  headingPath: string[];
  markdown: string;
  text: string;
  excerpt: string;
  blocks: ContentBlock[];
  anchors: {
    headingSlug: string;
    contentHash: string;
    fallbackText: string;
  };
  flags: {
    hasMermaid: boolean;
    isSelfTestSection: boolean;
    isMasterySection: boolean;
    isTerminologySection: boolean;
    isInterviewSection: boolean;
  };
};

export type SelfTestItem = {
  id: string;
  documentSlug: string;
  documentTitle: string;
  sectionId: string;
  order: number;
  prompt: string;
  sourceExcerpt: string;
  anchor: {
    sectionId: string;
    contentHash: string;
    fallbackText: string;
  };
};

export type TermEntry = {
  id: string;
  term: string;
  category: string;
  aliases: string[];
  definition: string;
  pmNotes: string;
  sourceDocumentSlug: string;
  sourceSectionId: string;
  sourceExcerpt: string;
};

export type ContentVersionArtifact = {
  id: string;
  gitSha: string | null;
  contentHash: string;
  generatedAt: string;
  documentCount: number;
  sectionCount: number;
  selfTestCount: number;
  termCount: number;
};

export type SearchRecord = {
  id: string;
  type: "section" | "term" | "self_test";
  title: string;
  documentSlug: string;
  documentTitle: string;
  sectionId: string;
  headingPath: string[];
  body: string;
  keywords: string[];
  href: string;
};
