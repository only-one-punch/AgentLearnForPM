import { eq } from "drizzle-orm";
import { contentVersions } from "@/db/schema";
import { getDb } from "@/lib/db/client";
import { getContentVersionArtifact } from "@/lib/content/artifacts";

export async function ensureCurrentContentVersion() {
  const artifact = await getContentVersionArtifact();
  const db = getDb();
  const existing = db
    .select()
    .from(contentVersions)
    .where(eq(contentVersions.contentHash, artifact.contentHash))
    .get();

  if (existing) {
    return existing;
  }

  const row = {
    id: artifact.id,
    gitSha: artifact.gitSha,
    contentHash: artifact.contentHash,
    generatedAt: new Date(artifact.generatedAt),
    documentCount: artifact.documentCount,
    artifactPath:
      process.env.GENERATED_CONTENT_DIR ?? process.env.KNOWLEDGE_ARTIFACT_DIR ?? ".generated/knowledge"
  };

  db.insert(contentVersions).values(row).run();
  return db.select().from(contentVersions).where(eq(contentVersions.id, artifact.id)).get();
}

export async function getCurrentContentVersionId() {
  const version = await ensureCurrentContentVersion();
  return version?.id ?? null;
}
