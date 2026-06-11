import { describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { setupDbTest, seedTestUser } from "../helpers/db";
import { contentVersions, readingProgress } from "@/db/schema";
import { getDb } from "@/lib/db/client";
import { ensureCurrentContentVersion } from "@/lib/content/version";
import { saveReadingProgress } from "@/lib/study/progress";

setupDbTest();

describe("content versions", () => {
  it("records current generated content and links progress to it", async () => {
    seedTestUser("user_a");
    const version = await ensureCurrentContentVersion();
    expect(version?.documentCount).toBe(16);

    await saveReadingProgress("user_a", {
      documentSlug: "04-tool-calling",
      sectionId: "section-a",
      scrollPercent: 50,
      completedPercent: 40
    });

    const progress = getDb().select().from(readingProgress).get();
    expect(progress?.contentVersionId).toBe(version?.id);
    expect(getDb().select().from(contentVersions).where(eq(contentVersions.id, version!.id)).get()).toBeTruthy();
  });
});
