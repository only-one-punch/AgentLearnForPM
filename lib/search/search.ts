import Fuse from "fuse.js";
import { getSearchRecords, getTerms } from "@/lib/content/artifacts";
import type { SearchRecord } from "@/lib/content/types";
import type { SearchHit, SearchResponse } from "@/lib/search/types";

let cachedRecords: SearchRecord[] | null = null;
let cachedFuse: Fuse<SearchRecord> | null = null;

async function getRecords() {
  if (!cachedRecords) {
    cachedRecords = await getSearchRecords();
  }
  return cachedRecords;
}

async function getFuse() {
  if (!cachedFuse) {
    cachedFuse = new Fuse(await getRecords(), {
      includeScore: true,
      ignoreLocation: true,
      threshold: 0.34,
      keys: [
        { name: "title", weight: 0.35 },
        { name: "keywords", weight: 0.28 },
        { name: "headingPath", weight: 0.2 },
        { name: "body", weight: 0.12 },
        { name: "documentTitle", weight: 0.05 }
      ]
    });
  }
  return cachedFuse;
}

export function resetSearchCacheForTests() {
  cachedRecords = null;
  cachedFuse = null;
}

export async function searchKnowledge(query: string, limit = 12): Promise<SearchResponse> {
  const normalizedQuery = query.trim();
  if (normalizedQuery.length < 2) {
    return { query: normalizedQuery, hits: [] };
  }

  const fuse = await getFuse();
  const results = fuse.search(normalizedQuery, { limit });
  return {
    query: normalizedQuery,
    hits: results.map(({ item, score }, index) => toHit(item, normalizedQuery, score ?? index + 1))
  };
}

function toHit(record: SearchRecord, query: string, score: number): SearchHit {
  return {
    id: record.id,
    type: record.type,
    title: record.title,
    documentSlug: record.documentSlug,
    documentTitle: record.documentTitle,
    sectionId: record.sectionId,
    headingPath: record.headingPath,
    snippet: makeSnippet(record.body, query),
    href: record.href,
    score
  };
}

function makeSnippet(body: string, query: string) {
  const normalized = body.replace(/\s+/g, " ").trim();
  const index = normalized.toLowerCase().indexOf(query.toLowerCase());
  if (index < 0) return normalized.slice(0, 220);
  const start = Math.max(0, index - 80);
  const end = Math.min(normalized.length, index + query.length + 140);
  return `${start > 0 ? "…" : ""}${normalized.slice(start, end)}${end < normalized.length ? "…" : ""}`;
}

export async function lookupTerms(query?: string, category?: string) {
  const normalizedQuery = query?.trim().toLowerCase();
  const normalizedCategory = category?.trim().toLowerCase();
  const terms = await getTerms();
  return terms.filter((term) => {
    const categoryMatches =
      !normalizedCategory || term.category.toLowerCase().includes(normalizedCategory);
    const queryMatches =
      !normalizedQuery ||
      [term.term, term.definition, term.pmNotes, ...term.aliases]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    return categoryMatches && queryMatches;
  });
}
