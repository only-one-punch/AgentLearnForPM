import { describe, expect, it } from "vitest";
import { buildReaderProgressLabel, getDocumentBySlug } from "../../components/ui/workbench-data";

describe("reader frontend contract", () => {
  it("loads a document with sections, mermaid fallback, and progress label", () => {
    const document = getDocumentBySlug("04-tool-calling");

    expect(document.title).toContain("Tool Calling");
    expect(document.sections.length).toBeGreaterThan(0);
    expect(document.sections.some((section) => section.blocks.some((block) => block.type === "mermaid"))).toBe(true);
    expect(buildReaderProgressLabel(document.completedPercent)).toBe("52%");
  });
});
