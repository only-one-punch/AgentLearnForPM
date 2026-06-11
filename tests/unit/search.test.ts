import { describe, expect, it } from "vitest";
import { searchKnowledge, lookupTerms, resetSearchCacheForTests } from "@/lib/search/search";

describe("private search index", () => {
  it("returns Tool Calling results for tool schema", async () => {
    resetSearchCacheForTests();
    const results = await searchKnowledge("tool schema");
    expect(results.hits.length).toBeGreaterThan(0);
    expect(results.hits.some((hit) => /Tool Calling|tool/i.test(`${hit.title} ${hit.documentTitle}`))).toBe(true);
  });

  it("returns Chinese safety/permission results", async () => {
    const results = await searchKnowledge("权限");
    expect(results.hits.length).toBeGreaterThan(0);
    expect(results.hits.some((hit) => /权限|安全|Least Privilege/.test(`${hit.title} ${hit.snippet}`))).toBe(true);
  });

  it("looks up terminology entries", async () => {
    const terms = await lookupTerms("权限");
    expect(terms.some((term) => /Privilege|Authorization|权限/.test(`${term.term} ${term.definition}`))).toBe(true);
  });
});
