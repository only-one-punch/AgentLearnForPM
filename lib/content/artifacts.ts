import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type {
  ContentVersionArtifact,
  KnowledgeDocument,
  KnowledgeSection,
  SearchRecord,
  SelfTestItem,
  TermEntry
} from "@/lib/content/types";

export const KNOWLEDGE_ARTIFACT_DIR =
  process.env.GENERATED_CONTENT_DIR ?? process.env.KNOWLEDGE_ARTIFACT_DIR ?? ".generated/knowledge";

async function readArtifact<T>(fileName: string, artifactDir = KNOWLEDGE_ARTIFACT_DIR): Promise<T> {
  const json = await readFile(resolve(artifactDir, fileName), "utf8");
  return JSON.parse(json) as T;
}

export function getKnowledgeDocuments(artifactDir?: string) {
  return readArtifact<KnowledgeDocument[]>("documents.json", artifactDir);
}

export function getKnowledgeSections(artifactDir?: string) {
  return readArtifact<KnowledgeSection[]>("sections.json", artifactDir);
}

export function getSelfTests(artifactDir?: string) {
  return readArtifact<SelfTestItem[]>("self-tests.json", artifactDir);
}

export function getTerms(artifactDir?: string) {
  return readArtifact<TermEntry[]>("terms.json", artifactDir);
}

export function getSearchRecords(artifactDir?: string) {
  return readArtifact<SearchRecord[]>("search.json", artifactDir);
}

export function getContentVersionArtifact(artifactDir?: string) {
  return readArtifact<ContentVersionArtifact>("content-version.json", artifactDir);
}

export async function getDocumentBySlug(slug: string, artifactDir?: string) {
  const documents = await getKnowledgeDocuments(artifactDir);
  return documents.find((document) => document.slug === slug) ?? null;
}

export async function getSectionsForDocument(slug: string, artifactDir?: string) {
  const sections = await getKnowledgeSections(artifactDir);
  return sections.filter((section) => section.documentSlug === slug);
}
