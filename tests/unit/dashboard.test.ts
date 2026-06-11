import { describe, expect, it } from "vitest";
import { getDashboardSnapshot } from "../../components/ui/workbench-data";

describe("dashboard frontend contract", () => {
  it("surfaces continue reading, weak items, and saved material", () => {
    const snapshot = getDashboardSnapshot();

    expect(snapshot.continueReading.slug).toBeTruthy();
    expect(snapshot.unfinished.length).toBeGreaterThan(0);
    expect(snapshot.weakItems.every((item) => item.status !== "mastered")).toBe(true);
    expect(snapshot.recentSaved.length).toBeGreaterThan(0);
  });
});
