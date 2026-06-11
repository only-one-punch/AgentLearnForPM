export type SearchHit = {
  id: string;
  type: "section" | "term" | "self_test";
  title: string;
  documentSlug: string;
  documentTitle: string;
  sectionId: string;
  headingPath: string[];
  snippet: string;
  href: string;
  score: number;
};

export type SearchResponse = {
  query: string;
  hits: SearchHit[];
};
