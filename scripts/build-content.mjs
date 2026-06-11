import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import GithubSlugger from "github-slugger";
import { toString } from "mdast-util-to-string";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";

const rootDir = resolve(".");
const sourceDir = resolve("agent-pm-tech-knowledge");
const indexPath = resolve(sourceDir, "INDEX.md");
const overridesPath = resolve(sourceDir, "workbench-overrides.json");
const outputDir = resolve(
  process.env.GENERATED_CONTENT_DIR ?? process.env.CONTENT_OUTPUT_DIR ?? ".generated/knowledge",
);

const processor = unified().use(remarkParse).use(remarkGfm);

function hash(input, length = 16) {
  return createHash("sha256").update(input).digest("hex").slice(0, length);
}

function stableJson(value) {
  return `${JSON.stringify(sortValue(value), null, 2)}\n`;
}

function sortValue(value) {
  if (Array.isArray(value)) return value.map(sortValue);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, child]) => [key, sortValue(child)])
  );
}

function readOverrides() {
  try {
    return JSON.parse(readFileSync(overridesPath, "utf8"));
  } catch {
    return { selfTests: {}, terms: {}, documents: {} };
  }
}

function getGitSha() {
  try {
    return execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

function discoverDocuments() {
  const markdown = readFileSync(indexPath, "utf8");
  const matches = [...markdown.matchAll(/\d+\.\s+\[([^\]]+\.md)\]\(([^)]+\.md)\)/g)];
  return matches.map((match, index) => {
    const fileName = match[1];
    const relativePath = match[2].replace(/^\.\//, "");
    const sourcePath = resolve(sourceDir, relativePath);
    return { order: index + 1, fileName, sourcePath };
  });
}

function stringifyNode(node) {
  const value = node.value ?? "";
  switch (node.type) {
    case "heading":
      return `${"#".repeat(node.depth)} ${toString(node)}\n`;
    case "paragraph":
      return `${node.children?.map(stringifyInline).join("") ?? ""}\n`;
    case "list":
      return stringifyList(node);
    case "listItem":
      return `${node.children?.map(stringifyNode).join("").trimEnd() ?? ""}\n`;
    case "blockquote":
      return `${(node.children ?? [])
        .map(stringifyNode)
        .join("")
        .split("\n")
        .filter(Boolean)
        .map((line) => `> ${line}`)
        .join("\n")}\n`;
    case "code":
      return `\`\`\`${node.lang ?? ""}\n${value}\n\`\`\`\n`;
    case "thematicBreak":
      return "---\n";
    case "table":
      return stringifyTable(node);
    case "html":
      return `${value}\n`;
    default:
      return `${toString(node)}\n`;
  }
}

function stringifyInline(node) {
  const children = node.children?.map(stringifyInline).join("") ?? "";
  switch (node.type) {
    case "text":
      return node.value ?? "";
    case "inlineCode":
      return `\`${node.value ?? ""}\``;
    case "strong":
      return `**${children}**`;
    case "emphasis":
      return `*${children}*`;
    case "delete":
      return `~~${children}~~`;
    case "link":
      return `[${children}](${node.url})`;
    case "image":
      return `![${node.alt ?? ""}](${node.url})`;
    case "break":
      return "\n";
    default:
      return children || toString(node);
  }
}

function stringifyList(node) {
  return `${(node.children ?? [])
    .map((item, index) => {
      const marker = node.ordered ? `${(node.start ?? 1) + index}.` : "-";
      const body = stringifyNode(item).trimEnd().replace(/\n/g, "\n  ");
      return `${marker} ${body}`;
    })
    .join("\n")}\n`;
}

function stringifyTable(node) {
  const rows = node.children ?? [];
  const cellValues = rows.map((row) => row.children.map((cell) => toString(cell).trim()));
  if (cellValues.length === 0) return "";
  const header = cellValues[0];
  const divider = header.map(() => "---");
  return `${[header, divider, ...cellValues.slice(1)].map((row) => `| ${row.join(" | ")} |`).join("\n")}\n`;
}

function splitIntoSections(tree, documentMeta) {
  const sections = [];
  const slugger = new GithubSlugger();
  let current = null;
  const pathByDepth = [];

  for (const node of tree.children ?? []) {
    if (node.type === "heading" && node.depth <= 3) {
      if (current) sections.push(current);
      const title = toString(node).trim();
      const headingSlug = slugger.slug(title);
      pathByDepth[node.depth - 1] = title;
      pathByDepth.length = node.depth;
      current = {
        heading: node,
        nodes: [],
        level: node.depth,
        title,
        headingSlug,
        headingPath: [...pathByDepth]
      };
    } else {
      if (!current) {
        current = {
          heading: null,
          nodes: [],
          level: 1,
          title: documentMeta.title,
          headingSlug: "overview",
          headingPath: [documentMeta.title]
        };
      }
      current.nodes.push(node);
    }
  }

  if (current) sections.push(current);

  return sections.map((section, index) => sectionToRecord(section, index + 1, documentMeta));
}

function sectionToRecord(section, order, documentMeta) {
  const bodyMarkdown = section.nodes.map(stringifyNode).join("\n").trim();
  const markdown = section.heading
    ? `${stringifyNode(section.heading).trimEnd()}\n\n${bodyMarkdown}`.trim()
    : bodyMarkdown;
  const text = normalizeText(toString({ type: "root", children: section.nodes }));
  const titleText = normalizeText(section.title);
  const contentHash = hash(text || titleText);
  const id = `${documentMeta.slug}__s${String(order).padStart(3, "0")}__${contentHash.slice(0, 8)}`;
  const blocks = createBlocks(section.nodes);
  const flags = {
    hasMermaid: blocks.some((block) => block.type === "mermaid"),
    isSelfTestSection: /自测|self.?test/i.test(section.title),
    isMasterySection: /掌握标准|mastery/i.test(section.title),
    isTerminologySection: /glossary|术语|关键词|速查/i.test(section.title),
    isInterviewSection: /面试|interview/i.test(section.title)
  };

  return {
    id,
    documentSlug: documentMeta.slug,
    documentTitle: documentMeta.title,
    sourcePath: documentMeta.sourcePath,
    order,
    level: section.level,
    title: section.title,
    headingPath: section.headingPath,
    markdown,
    text,
    excerpt: excerpt(text || titleText),
    blocks,
    anchors: {
      headingSlug: section.headingSlug,
      contentHash,
      fallbackText: excerpt(text, 180)
    },
    flags
  };
}

function createBlocks(nodes) {
  const blocks = [];
  let markdownBuffer = [];

  function flushMarkdown() {
    const markdown = markdownBuffer.join("\n").trim();
    if (!markdown) return;
    blocks.push({
      type: "markdown",
      markdown,
      text: normalizeText(markdown.replace(/[`*_>|#-]/g, " "))
    });
    markdownBuffer = [];
  }

  for (const node of nodes) {
    if (node.type === "code" && node.lang === "mermaid") {
      flushMarkdown();
      blocks.push({ type: "mermaid", code: node.value ?? "", text: node.value ?? "" });
    } else {
      markdownBuffer.push(stringifyNode(node));
    }
  }

  flushMarkdown();
  return blocks;
}

function normalizeText(text) {
  return text.replace(/\s+/g, " ").trim();
}

function excerpt(text, maxLength = 240) {
  const normalized = normalizeText(text);
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trim()}…`;
}

function slugFromFileName(fileName) {
  const baseName = fileName.replace(/\.md$/, "");
  const number = baseName.match(/^\d+/)?.[0] ?? hash(baseName, 4);
  const title = baseName.replace(/^\d+-?/, "");
  const ascii = title
    .replace(/[^\w\s-]+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return ascii ? `${number}-${ascii}` : number;
}

function extractUpdatedAt(markdown) {
  return markdown.match(/更新日期[:：]\s*([0-9-]+)/)?.[1];
}

function extractSelfTests(document, sections, overrides) {
  const items = [];
  for (const section of sections) {
    if (!section.flags.isSelfTestSection) continue;
    const lines = section.markdown.split("\n");
    const questionLines = lines.filter((line) => /^(\s*[-*]\s+|\s*\d+[.)、]\s+)/.test(line));
    for (const line of questionLines) {
      const prompt = normalizeText(line.replace(/^(\s*[-*]\s+|\s*\d+[.)、]\s+)/, ""));
      if (!prompt || /掌握|标准|面试官|模板|踩坑/.test(prompt)) continue;
      const id = `${document.slug}__self-test__${hash(prompt, 12)}`;
      items.push({
        id,
        documentSlug: document.slug,
        documentTitle: document.title,
        sectionId: section.id,
        order: items.length + 1,
        prompt,
        sourceExcerpt: section.excerpt,
        anchor: {
          sectionId: section.id,
          contentHash: section.anchors.contentHash,
          fallbackText: prompt
        }
      });
    }
  }

  return applySelfTestOverrides(items, overrides.selfTests?.[document.slug]);
}

function applySelfTestOverrides(items, overridesForDocument) {
  if (!overridesForDocument) return items;
  const byId = new Map(items.map((item) => [item.id, item]));
  for (const [id, patch] of Object.entries(overridesForDocument)) {
    if (patch === null) {
      byId.delete(id);
    } else if (byId.has(id)) {
      byId.set(id, { ...byId.get(id), ...patch });
    } else {
      byId.set(id, { id, ...patch });
    }
  }
  return [...byId.values()].map((item, index) => ({ ...item, order: index + 1 }));
}

function extractTerms(document, sections, tree, overrides) {
  const terms = [];
  let currentCategory = "";

  function visit(node, sectionId) {
    if (node.type === "heading") {
      const heading = toString(node).trim();
      if (/Glossary|术语|Keywords|关键词/i.test(heading)) {
        currentCategory = heading.replace(/^(\d+\.?\s*)?Glossary:\s*/i, "").trim();
      }
      return;
    }

    if (node.type === "table" && currentCategory) {
      const rows = node.children ?? [];
      if (rows.length < 2) return;
      const header = rows[0].children.map((cell) => normalizeText(toString(cell)));
      const termIndex = header.findIndex((name) => /术语|term/i.test(name));
      const definitionIndex = header.findIndex((name) => /解释|definition|一句话/i.test(name));
      if (termIndex < 0 || definitionIndex < 0) return;
      const pmIndex = header.findIndex((name) => /PM|要点|notes/i.test(name));
      for (const row of rows.slice(1)) {
        const cells = row.children.map((cell) => normalizeText(toString(cell)));
        const term = cells[termIndex];
        const definition = cells[definitionIndex];
        if (!term || !definition || /^[-—]+$/.test(term)) continue;
        const sourceSection = sections.find((section) => section.id === sectionId) ?? sections[0];
        terms.push({
          id: `term__${hash(`${currentCategory}:${term}`, 14)}`,
          term,
          category: currentCategory,
          aliases: term.split(/[／/(),，、]/).map(normalizeText).filter((part) => part && part !== term),
          definition,
          pmNotes: pmIndex >= 0 ? cells[pmIndex] ?? "" : "",
          sourceDocumentSlug: document.slug,
          sourceSectionId: sourceSection.id,
          sourceExcerpt: sourceSection.excerpt
        });
      }
    }

    for (const child of node.children ?? []) {
      const section = findSectionForNode(child, sections) ?? sectionId;
      visit(child, section);
    }
  }

  let sectionIndex = 0;
  for (const node of tree.children ?? []) {
    if (node.type === "heading" && node.depth <= 3) {
      sectionIndex += 1;
    }
    visit(node, sections[Math.max(0, sectionIndex - 1)]?.id ?? sections[0]?.id);
  }

  return applyTermOverrides(terms, overrides.terms?.[document.slug]);
}

function findSectionForNode() {
  return null;
}

function applyTermOverrides(terms, overridesForDocument) {
  if (!overridesForDocument) return terms;
  const byId = new Map(terms.map((term) => [term.id, term]));
  for (const [id, patch] of Object.entries(overridesForDocument)) {
    if (patch === null) {
      byId.delete(id);
    } else if (byId.has(id)) {
      byId.set(id, { ...byId.get(id), ...patch });
    } else {
      byId.set(id, { id, ...patch });
    }
  }
  return [...byId.values()];
}

function makeSearchRecords(sections, terms, selfTests) {
  const sectionRecords = sections.map((section) => ({
    id: `section:${section.id}`,
    type: "section",
    title: section.title,
    documentSlug: section.documentSlug,
    documentTitle: section.documentTitle,
    sectionId: section.id,
    headingPath: section.headingPath,
    body: section.text,
    keywords: [
      section.documentTitle,
      ...section.headingPath,
      section.flags.isInterviewSection ? "interview 面试" : "",
      section.flags.isSelfTestSection ? "self test 自测" : "",
      section.flags.isTerminologySection ? "glossary terminology 术语" : ""
    ].filter(Boolean),
    href: `/docs/${section.documentSlug}#${section.id}`
  }));

  const termRecords = terms.map((term) => ({
    id: `term:${term.id}`,
    type: "term",
    title: term.term,
    documentSlug: term.sourceDocumentSlug,
    documentTitle: "术语表与速查表",
    sectionId: term.sourceSectionId,
    headingPath: [term.category, term.term],
    body: `${term.definition} ${term.pmNotes}`,
    keywords: [term.category, term.term, ...term.aliases, "术语 terminology glossary"],
    href: `/terms?term=${encodeURIComponent(term.term)}`
  }));

  const selfTestRecords = selfTests.map((item) => ({
    id: `self-test:${item.id}`,
    type: "self_test",
    title: item.prompt,
    documentSlug: item.documentSlug,
    documentTitle: item.documentTitle,
    sectionId: item.sectionId,
    headingPath: ["面试卡片与自测", "读完自测题"],
    body: item.prompt,
    keywords: ["self test 自测 掌握 mastery"],
    href: `/docs/${item.documentSlug}#${item.sectionId}`
  }));

  return [...sectionRecords, ...termRecords, ...selfTestRecords];
}

function writeArtifact(name, value) {
  mkdirSync(outputDir, { recursive: true });
  const artifactPath = resolve(outputDir, name);
  const tempPath = resolve(outputDir, `.${name}.${process.pid}.tmp`);
  writeFileSync(tempPath, stableJson(value));
  renameSync(tempPath, artifactPath);
}

function main() {
  const overrides = readOverrides();
  const discovered = discoverDocuments();
  const documents = [];
  const allSections = [];
  const allSelfTests = [];
  const allTerms = [];

  for (const doc of discovered) {
    const markdown = readFileSync(doc.sourcePath, "utf8");
    const tree = processor.parse(markdown);
    const title =
      (tree.children ?? []).find((node) => node.type === "heading" && node.depth === 1)
        ? toString((tree.children ?? []).find((node) => node.type === "heading" && node.depth === 1)).trim()
        : doc.fileName.replace(/\.md$/, "");
    const slug = overrides.documents?.[doc.fileName]?.slug ?? slugFromFileName(doc.fileName);
    const sourcePath = relative(rootDir, doc.sourcePath);
    const document = {
      slug,
      sourcePath,
      title,
      order: doc.order,
      summary: excerpt(markdown.replace(/^#.*$/m, ""), 220),
      updatedAt: extractUpdatedAt(markdown),
      headingCount: (tree.children ?? []).filter((node) => node.type === "heading").length,
      sectionCount: 0,
      selfTestCount: 0,
      termCount: 0,
      contentHash: hash(markdown, 24)
    };
    const sections = splitIntoSections(tree, document);
    const selfTests = extractSelfTests(document, sections, overrides);
    const terms = extractTerms(document, sections, tree, overrides);
    document.sectionCount = sections.length;
    document.selfTestCount = selfTests.length;
    document.termCount = terms.length;
    documents.push(document);
    allSections.push(...sections);
    allSelfTests.push(...selfTests);
    allTerms.push(...terms);
  }

  const search = makeSearchRecords(allSections, allTerms, allSelfTests);
  const contentHash = hash(
    stableJson({ documents, sections: allSections, selfTests: allSelfTests, terms: allTerms }),
    32
  );
  const contentVersion = {
    id: `content_${contentHash.slice(0, 16)}`,
    gitSha: getGitSha(),
    contentHash,
    generatedAt: new Date(0).toISOString(),
    documentCount: documents.length,
    sectionCount: allSections.length,
    selfTestCount: allSelfTests.length,
    termCount: allTerms.length
  };

  writeArtifact("documents.json", documents);
  writeArtifact("sections.json", allSections);
  writeArtifact("self-tests.json", allSelfTests);
  writeArtifact("terms.json", allTerms);
  writeArtifact("search.json", search);
  writeArtifact("content-version.json", contentVersion);

  console.log(
    `Generated ${documents.length} documents, ${allSections.length} sections, ${allSelfTests.length} self-tests, ${allTerms.length} terms.`
  );
}

main();
