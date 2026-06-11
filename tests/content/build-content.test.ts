import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { KnowledgeDocument, KnowledgeSection, SelfTestItem, TermEntry } from "@/lib/content/types";

function runBuild() {
  execFileSync("node", ["scripts/build-content.mjs"], { stdio: "pipe" });
}

function readArtifact<T>(name: string): T {
  return JSON.parse(readFileSync(resolve(".generated/knowledge", name), "utf8")) as T;
}

describe("content compiler", () => {
  it("emits 16 documents in INDEX order", () => {
    runBuild();
    const documents = readArtifact<KnowledgeDocument[]>("documents.json");
    expect(documents).toHaveLength(16);
    expect(documents.map((document) => document.sourcePath)).toEqual([
      "agent-pm-tech-knowledge/00-Agent-PM-技术知识总览.md",
      "agent-pm-tech-knowledge/01-LLM基础.md",
      "agent-pm-tech-knowledge/02-Agent基础.md",
      "agent-pm-tech-knowledge/03-Agent架构总览.md",
      "agent-pm-tech-knowledge/04-Tool-Calling工具调用.md",
      "agent-pm-tech-knowledge/05-RAG知识库与检索增强.md",
      "agent-pm-tech-knowledge/06-Memory记忆系统.md",
      "agent-pm-tech-knowledge/07-Workflow编排与自动化.md",
      "agent-pm-tech-knowledge/08-Multi-Agent多智能体.md",
      "agent-pm-tech-knowledge/09-Eval评测体系.md",
      "agent-pm-tech-knowledge/10-稳定性成本与性能.md",
      "agent-pm-tech-knowledge/11-安全权限与合规.md",
      "agent-pm-tech-knowledge/12-Agent产品化方法.md",
      "agent-pm-tech-knowledge/13-常见技术面试题.md",
      "agent-pm-tech-knowledge/14-Agent产品设计题答题框架.md",
      "agent-pm-tech-knowledge/15-术语表与速查表.md"
    ]);
  });

  it("preserves Mermaid blocks and extracts self-tests and terms", () => {
    runBuild();
    const sections = readArtifact<KnowledgeSection[]>("sections.json");
    const selfTests = readArtifact<SelfTestItem[]>("self-tests.json");
    const terms = readArtifact<TermEntry[]>("terms.json");

    expect(sections.some((section) => section.blocks.some((block) => block.type === "mermaid"))).toBe(true);
    expect(selfTests.length).toBeGreaterThan(100);
    expect(selfTests.some((item) => item.documentSlug.includes("tool-calling"))).toBe(true);
    expect(terms.some((term) => term.term === "Tool Calling")).toBe(true);
    expect(terms.some((term) => term.term === "Least Privilege")).toBe(true);
  });

  it("is deterministic for unchanged markdown", () => {
    runBuild();
    const first = readFileSync(resolve(".generated/knowledge/sections.json"), "utf8");
    runBuild();
    const second = readFileSync(resolve(".generated/knowledge/sections.json"), "utf8");
    expect(second).toBe(first);
  });
});
