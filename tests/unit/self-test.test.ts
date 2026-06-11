import { describe, expect, it } from "vitest";
import { setupDbTest, seedTestUser } from "../helpers/db";
import { listWeakSelfTests, setSelfTestState } from "@/lib/study/mastery";

setupDbTest();

describe("self-test mastery", () => {
  it("adds and removes weak review items as status changes", async () => {
    seedTestUser("user_a");
    await setSelfTestState("user_a", {
      itemId: "item-1",
      documentSlug: "04-tool-calling",
      status: "not_yet"
    });
    expect(listWeakSelfTests("user_a").map((item) => item.itemId)).toContain("item-1");

    await setSelfTestState("user_a", {
      itemId: "item-1",
      documentSlug: "04-tool-calling",
      status: "mastered"
    });
    expect(listWeakSelfTests("user_a").map((item) => item.itemId)).not.toContain("item-1");
  });
});
