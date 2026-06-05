import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const sourcePath = resolve("agent-pm-tech-knowledge/04-Tool-Calling工具调用.md");
const outputPath = resolve("agent-pm-tech-knowledge/html/04-tool-calling.html");
const markdown = readFileSync(sourcePath, "utf8");

mkdirSync(dirname(outputPath), { recursive: true });

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tool Calling 工具调用 | Agent PM 技术手册</title>
  <style>
    @import url("https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@500;700;900&family=Source+Sans+3:wght@400;500;600;700;800&display=swap");

    :root {
      --ink: #20231f;
      --ink-strong: #111611;
      --muted: #687068;
      --paper: #f3efe4;
      --paper-deep: #e8e1cf;
      --surface: #fffdf7;
      --surface-soft: #faf7ec;
      --line: #d8d0bd;
      --line-strong: #aaa088;
      --mint: #0b756c;
      --mint-soft: #dceee8;
      --clay: #a94a34;
      --clay-soft: #f4ddd3;
      --mustard: #b97d25;
      --olive: #596543;
      --night: #18211d;
      --code-bg: #20241f;
      --code-fg: #edf0e7;
      --shadow: 0 18px 44px rgba(32, 35, 31, 0.11);
      --shadow-soft: 0 8px 28px rgba(32, 35, 31, 0.07);
      --radius: 8px;
      --sans: "Source Sans 3", "PingFang SC", "Microsoft YaHei", sans-serif;
      --serif: "Noto Serif SC", "Songti SC", serif;
    }

    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      color: var(--ink);
      background:
        linear-gradient(90deg, rgba(11,117,108,0.08), transparent 30%),
        linear-gradient(180deg, #fbfaf4 0%, var(--paper) 62%, var(--paper-deep) 100%);
      font-family: var(--sans);
      letter-spacing: 0;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
    }

    body::before {
      content: "";
      position: fixed;
      inset: 0;
      pointer-events: none;
      background-image:
        linear-gradient(rgba(35,35,31,0.035) 1px, transparent 1px),
        linear-gradient(90deg, rgba(35,35,31,0.025) 1px, transparent 1px);
      background-size: 28px 28px;
      mask-image: linear-gradient(90deg, rgba(0,0,0,0.55), transparent 74%);
    }

    ::selection {
      color: var(--ink-strong);
      background: rgba(185,125,37,0.24);
    }

    .progress {
      position: fixed;
      top: 0;
      left: 0;
      height: 3px;
      width: 0%;
      z-index: 40;
      background: linear-gradient(90deg, var(--mint), var(--clay), var(--mustard));
    }

    .app {
      display: grid;
      grid-template-columns: minmax(248px, 300px) minmax(0, 900px) minmax(220px, 286px);
      justify-content: center;
      align-items: start;
      gap: clamp(18px, 2.6vw, 34px);
      min-height: 100vh;
      padding: 24px clamp(16px, 3vw, 36px) 72px;
    }

    .sidebar {
      position: sticky;
      top: 24px;
      height: calc(100vh - 48px);
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 20px;
      color: #f2f2ea;
      background:
        linear-gradient(180deg, rgba(255,255,255,0.06), transparent 28%),
        var(--night);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      overflow: hidden;
      animation: rise 520ms cubic-bezier(.2,.8,.2,1) both;
    }

    .brand {
      display: grid;
      gap: 8px;
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(255,255,255,0.12);
    }

    .brand .eyebrow {
      color: #a9ded4;
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
    }

    .brand h1 {
      margin: 0;
      font-family: var(--serif);
      font-size: 26px;
      line-height: 1.15;
      letter-spacing: 0;
    }

    .brand p {
      margin: 0;
      color: #c9ccbf;
      font-size: 14px;
      line-height: 1.55;
    }

    .search {
      width: 100%;
      border: 1px solid rgba(255,255,255,0.18);
      border-radius: var(--radius);
      padding: 12px 13px;
      color: #f7f8f2;
      background: rgba(255,255,255,0.09);
      font: 500 14px var(--sans);
      outline: none;
      transition: border-color 160ms ease, box-shadow 160ms ease, background 160ms ease;
    }

    .search:focus {
      border-color: #a9ded4;
      background: rgba(255,255,255,0.12);
      box-shadow: 0 0 0 3px rgba(166,214,202,0.16);
    }

    .nav {
      overflow: auto;
      padding-right: 6px;
      display: grid;
      gap: 3px;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.26) transparent;
    }

    .nav a {
      display: block;
      padding: 8px 10px;
      color: #dfe2d7;
      text-decoration: none;
      border-left: 3px solid transparent;
      border-radius: 0 6px 6px 0;
      font-size: 14px;
      line-height: 1.28;
      transition: color 150ms ease, background 150ms ease, transform 150ms ease, border-color 150ms ease;
    }

    .nav a.depth-3 { padding-left: 20px; color: #b9beb0; font-size: 13px; }
    .nav a:hover {
      color: #ffffff;
      background: rgba(255,255,255,0.08);
      transform: translateX(2px);
    }
    .nav a.active {
      color: #ffffff;
      background: rgba(169,222,212,0.14);
      border-left-color: #a9ded4;
    }

    main {
      min-width: 0;
    }

    .topbar {
      position: sticky;
      top: 14px;
      z-index: 20;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
      padding: 9px 10px;
      border: 1px solid rgba(216,208,189,0.72);
      border-radius: var(--radius);
      background: rgba(255,253,247,0.78);
      box-shadow: 0 8px 22px rgba(32, 35, 31, 0.06);
      backdrop-filter: blur(14px);
    }

    .crumb {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      color: var(--muted);
      font-size: 14px;
    }

    .pill {
      display: inline-flex;
      align-items: center;
      min-height: 30px;
      padding: 4px 10px;
      border: 1px solid var(--line);
      border-radius: 999px;
      background: rgba(250,247,236,0.82);
      color: var(--ink);
      font-weight: 700;
      white-space: nowrap;
    }

    .jump {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .jump a {
      min-height: 34px;
      padding: 7px 11px;
      border: 1px solid var(--line);
      border-radius: var(--radius);
      color: var(--ink);
      background: rgba(250,247,236,0.78);
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      transition: transform 150ms ease, border-color 150ms ease, background 150ms ease;
    }

    .jump a:hover {
      transform: translateY(-1px);
      border-color: var(--line-strong);
      background: var(--surface);
    }

    .hero {
      position: relative;
      padding: clamp(30px, 6vw, 76px) 0 clamp(24px, 4vw, 46px);
      border-bottom: 1px solid var(--line-strong);
      overflow: hidden;
      animation: rise 620ms cubic-bezier(.2,.8,.2,1) 70ms both;
    }

    .hero::before {
      content: "ACTION";
      position: absolute;
      right: 0;
      top: 4px;
      color: rgba(32,35,31,0.045);
      font-size: clamp(64px, 13vw, 150px);
      font-weight: 900;
      line-height: 1;
      pointer-events: none;
    }

    .hero-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(220px, 310px);
      gap: clamp(24px, 5vw, 54px);
      align-items: end;
    }

    .hero h2 {
      margin: 0 0 16px;
      max-width: 760px;
      font-family: var(--serif);
      font-size: clamp(40px, 7.2vw, 82px);
      line-height: 0.98;
      letter-spacing: 0;
    }

    .hero .dek {
      max-width: 700px;
      margin: 0;
      color: #42443d;
      font-size: clamp(18px, 2.1vw, 22px);
      line-height: 1.62;
    }

    .hero-panel {
      padding: 18px 0 0;
      border-top: 3px solid var(--mint);
    }

    .metric {
      display: grid;
      gap: 8px;
      margin-bottom: 18px;
    }

    .metric strong {
      font-family: var(--serif);
      font-size: 44px;
      line-height: 1;
    }

    .metric span {
      color: var(--muted);
      font-size: 14px;
      line-height: 1.35;
    }

    .reader {
      margin-top: 28px;
      background: rgba(255,253,247,0.88);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      box-shadow: var(--shadow-soft);
      overflow: hidden;
      animation: rise 620ms cubic-bezier(.2,.8,.2,1) 130ms both;
    }

    .article {
      padding: clamp(24px, 4.2vw, 58px);
      counter-reset: chapter;
    }

    .chapter {
      padding: clamp(30px, 4.4vw, 50px) 0;
      border-bottom: 1px solid var(--line);
      counter-increment: chapter;
    }

    .chapter:first-child { padding-top: 0; }
    .chapter:last-child { border-bottom: 0; }
    .chapter.is-hidden { display: none; }

    .chapter > h2 {
      margin: 0 0 22px;
      max-width: 780px;
      font-family: var(--serif);
      font-size: clamp(30px, 4vw, 46px);
      line-height: 1.12;
      letter-spacing: 0;
    }

    .chapter > h2::after {
      content: "";
      display: block;
      width: 76px;
      height: 3px;
      margin-top: 14px;
      background: linear-gradient(90deg, var(--mint), var(--mustard));
    }

    h3 {
      margin: 34px 0 12px;
      font-size: clamp(21px, 2.5vw, 28px);
      line-height: 1.18;
      letter-spacing: 0;
    }

    h4 {
      margin: 22px 0 10px;
      font-size: 18px;
      line-height: 1.25;
    }

    p, li {
      color: #353731;
      font-size: 18px;
      line-height: 1.82;
    }

    p { margin: 12px 0; max-width: 760px; }
    strong { color: var(--ink); }

    a {
      color: #0d6d61;
      text-underline-offset: 3px;
    }

    blockquote {
      margin: 22px 0;
      padding: 16px 20px;
      border-left: 4px solid var(--clay);
      background: var(--clay-soft);
      border-radius: 0 var(--radius) var(--radius) 0;
    }

    blockquote p { margin: 0; color: #552516; font-weight: 700; }

    ul, ol {
      padding-left: 24px;
      margin: 12px 0 18px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0 30px;
      font-size: 15px;
      background: var(--surface);
      border: 1px solid var(--line);
      box-shadow: 0 6px 18px rgba(32,35,31,0.04);
    }

    th, td {
      vertical-align: top;
      padding: 12px 14px;
      border-bottom: 1px solid var(--line);
      border-right: 1px solid var(--line);
      line-height: 1.5;
    }

    th {
      text-align: left;
      color: #1f322d;
      background: var(--mint-soft);
      font-weight: 800;
    }

    tr:nth-child(even) td { background: rgba(250,247,236,0.58); }
    tr:last-child td { border-bottom: 0; }
    td:last-child, th:last-child { border-right: 0; }

    code {
      padding: 2px 5px;
      border-radius: 5px;
      color: #173b34;
      background: #e5f0eb;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 0.9em;
      word-break: break-word;
    }

    pre {
      overflow: auto;
      margin: 18px 0 28px;
      padding: 18px;
      color: var(--code-fg);
      background: var(--code-bg);
      border-radius: var(--radius);
      border: 1px solid #3c4438;
      line-height: 1.55;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
    }

    pre code {
      padding: 0;
      color: inherit;
      background: transparent;
      border-radius: 0;
      font-size: 14px;
    }

    .mermaid {
      margin: 20px 0 28px;
      padding: 18px;
      background: #fbfdf8;
      border: 1px solid var(--line);
      border-radius: var(--radius);
      overflow: auto;
    }

    .study-rail {
      position: sticky;
      top: 24px;
      height: calc(100vh - 48px);
      display: flex;
      flex-direction: column;
      gap: 14px;
      overflow: auto;
      animation: rise 620ms cubic-bezier(.2,.8,.2,1) 180ms both;
    }

    .study-card {
      padding: 16px;
      background: rgba(255,253,247,0.86);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      box-shadow: 0 10px 26px rgba(32, 35, 31, 0.06);
    }

    .study-card h3 {
      margin: 0 0 10px;
      font-family: var(--serif);
      font-size: 20px;
    }

    .study-card p,
    .study-card li {
      font-size: 14px;
      line-height: 1.55;
      color: var(--muted);
    }

    .study-card ul { padding-left: 18px; margin-bottom: 0; }

    .focus {
      border-top: 3px solid var(--clay);
    }

    .section-label {
      display: inline-block;
      margin-bottom: 8px;
      color: var(--clay);
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
    }

    .empty-state {
      display: none;
      padding: 34px;
      margin-top: 24px;
      border: 1px dashed var(--line-strong);
      border-radius: var(--radius);
      background: rgba(255,253,247,0.78);
      color: var(--muted);
    }

    .empty-state.show { display: block; }

    a:focus-visible,
    input:focus-visible {
      outline: 3px solid rgba(11,117,108,0.28);
      outline-offset: 2px;
    }

    @keyframes rise {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 1180px) {
      .app {
        grid-template-columns: minmax(210px, 250px) minmax(0, 1fr);
      }
      .study-rail { display: none; }
      .hero-grid { grid-template-columns: 1fr; }
    }

    @media (max-width: 820px) {
      .app {
        display: block;
        padding: 12px 12px 44px;
      }
      .sidebar {
        position: relative;
        top: 0;
        height: auto;
        max-height: 48vh;
        margin-bottom: 16px;
      }
      .topbar {
        align-items: flex-start;
        flex-direction: column;
        position: relative;
        top: 0;
      }
      .jump { justify-content: flex-start; }
      .article { padding: 18px; }
      table { display: block; overflow-x: auto; }
      .hero h2 { font-size: clamp(34px, 14vw, 58px); }
    }

    @media (prefers-reduced-motion: reduce) {
      html { scroll-behavior: auto; }
      * { transition: none !important; animation: none !important; }
    }
  </style>
</head>
<body>
  <div class="progress" id="progress"></div>
  <div class="app">
    <aside class="sidebar">
      <div class="brand">
        <span class="eyebrow">Agent PM Handbook</span>
        <h1>Tool Calling 工具调用</h1>
        <p>把“会说”的模型，设计成“能做事但不乱做”的 Agent。</p>
      </div>
      <input class="search" id="search" type="search" placeholder="搜索章节、指标、权限..." />
      <nav class="nav" id="toc" aria-label="章节目录"></nav>
    </aside>

    <main>
      <div class="topbar">
        <div class="crumb">
          <span>Agent PM 技术知识库</span>
          <span class="pill">04</span>
          <span>Tool Calling</span>
        </div>
        <div class="jump" id="quickLinks">
          <a href="#top" data-match="先读这一页">速读</a>
          <a href="#top" data-match="决策树">决策树</a>
          <a href="#top" data-match="GTM">案例</a>
          <a href="#top" data-match="面试卡片">自测</a>
        </div>
      </div>

      <section class="hero">
        <div class="hero-grid">
          <div>
            <h2>Tool Calling 是 Agent 的行动契约</h2>
            <p class="dek">从工具定义、调用循环、权限边界到面试表达，建立一套能落到产品方案里的 Agent 执行判断。</p>
          </div>
          <div class="hero-panel">
            <div class="metric">
              <strong id="chapterCount">16</strong>
              <span>个章节，按“速读 → 决策 → 风险 → 案例 → 面试”重新组织。</span>
            </div>
            <div class="metric">
              <strong>80%</strong>
              <span>目标是面试可用理解，不是工程实现深钻。</span>
            </div>
          </div>
        </div>
      </section>

      <section class="reader">
        <article class="article" id="article"></article>
      </section>
      <div class="empty-state" id="empty">没有找到匹配内容。换个关键词试试，比如：权限、审批、trace、CRM。</div>
    </main>

    <aside class="study-rail" aria-label="学习辅助">
      <div class="study-card focus">
        <span class="section-label">记忆锚点</span>
        <h3>一句话讲清</h3>
        <p>模型建议动作，系统执行动作，产品定义哪些动作允许自动发生。</p>
      </div>
      <div class="study-card">
        <h3>面试必打点</h3>
        <ul>
          <li>Tool schema 是给模型看的产品接口。</li>
          <li>权限必须在系统层校验。</li>
          <li>高风险动作要 human-in-the-loop。</li>
          <li>评估要看过程 trace，不只看最终答案。</li>
        </ul>
      </div>
      <div class="study-card">
        <h3>当前章节</h3>
        <p id="currentSection">准备开始阅读</p>
      </div>
    </aside>
  </div>

  <script type="application/json" id="markdown-source">${JSON.stringify(markdown)}</script>
  <script>
    const md = JSON.parse(document.getElementById("markdown-source").textContent);
    const article = document.getElementById("article");
    const toc = document.getElementById("toc");
    const progress = document.getElementById("progress");
    const search = document.getElementById("search");
    const empty = document.getElementById("empty");
    const currentSection = document.getElementById("currentSection");
    const tick = String.fromCharCode(96);
    const fenceMarker = tick.repeat(3);

    function escapeHtml(value) {
      return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    function slugify(text, used) {
      const base = text
        .replace(/^\\d+\\.\\s*/, "")
        .replace(new RegExp("[#" + tick + "*_\\\\[\\\\]()]", "g"), "")
        .replace(/\\s+/g, "-")
        .replace(/[^\u4e00-\u9fa5a-zA-Z0-9-]/g, "")
        .slice(0, 42) || "section";
      let slug = base.toLowerCase();
      let index = 2;
      while (used.has(slug)) {
        slug = base.toLowerCase() + "-" + index;
        index += 1;
      }
      used.add(slug);
      return slug;
    }

    function inline(text) {
      let value = escapeHtml(text);
      value = value.replace(/\\[([^\\]]+)\\]\\(([^\\)]+)\\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
      value = value.replace(new RegExp(tick + "([^" + tick + "]+)" + tick, "g"), '<code>$1</code>');
      value = value.replace(/\\*\\*([^*]+)\\*\\*/g, '<strong>$1</strong>');
      return value;
    }

    function parseTable(lines, start) {
      const rows = [];
      let i = start;
      while (i < lines.length && /^\\s*\\|/.test(lines[i])) {
        rows.push(lines[i]);
        i += 1;
      }
      if (rows.length < 2 || !/\\|\\s*:?-{3,}:?\\s*\\|/.test(rows[1])) return null;
      const cells = row => row.trim().replace(/^\\|/, "").replace(/\\|$/, "").split("|").map(cell => inline(cell.trim()));
      const head = cells(rows[0]);
      const body = rows.slice(2).map(cells);
      const html = '<table><thead><tr>' + head.map(c => '<th>' + c + '</th>').join("") + '</tr></thead><tbody>' +
        body.map(row => '<tr>' + row.map(c => '<td>' + c + '</td>').join("") + '</tr>').join("") +
        '</tbody></table>';
      return { html, next: i };
    }

    function parseMarkdown(source) {
      const lines = source.split(/\\r?\\n/);
      const used = new Set();
      const headings = [];
      let html = "";
      let paragraph = [];
      let list = null;
      let inSection = false;
      let code = null;

      const flushParagraph = () => {
        if (!paragraph.length) return;
        html += '<p>' + inline(paragraph.join(" ")) + '</p>';
        paragraph = [];
      };

      const closeList = () => {
        if (!list) return;
        html += '</' + list + '>';
        list = null;
      };

      const closeSection = () => {
        flushParagraph();
        closeList();
        if (inSection) html += '</section>';
      };

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (code) {
          if (line.startsWith(fenceMarker)) {
            const body = escapeHtml(code.lines.join("\\n"));
            if (code.lang === "mermaid") {
              html += '<div class="mermaid">' + body + '</div>';
            } else {
              html += '<pre><code>' + body + '</code></pre>';
            }
            code = null;
          } else {
            code.lines.push(line);
          }
          continue;
        }

        if (line.startsWith(fenceMarker)) {
          flushParagraph();
          closeList();
          code = { lang: line.slice(fenceMarker.length).trim().split(/\\s+/)[0].toLowerCase(), lines: [] };
          continue;
        }

        if (!line.trim()) {
          flushParagraph();
          closeList();
          continue;
        }

        const heading = line.match(/^(#{1,4})\\s+(.+)$/);
        if (heading) {
          flushParagraph();
          closeList();
          const level = heading[1].length;
          const text = heading[2].trim();
          const id = level === 1 ? "top" : "sec-" + slugify(text, used);
          if (level === 1) {
            html += '<h1 id="' + id + '">' + inline(text) + '</h1>';
          } else if (level === 2) {
            closeSection();
            inSection = true;
            headings.push({ id, text, level });
            html += '<section class="chapter" id="' + id + '"><h2>' + inline(text) + '</h2>';
          } else {
            headings.push({ id, text, level });
            html += '<h' + level + ' id="' + id + '">' + inline(text) + '</h' + level + '>';
          }
          continue;
        }

        const table = parseTable(lines, i);
        if (table) {
          flushParagraph();
          closeList();
          html += table.html;
          i = table.next - 1;
          continue;
        }

        if (/^>\\s?/.test(line)) {
          flushParagraph();
          closeList();
          html += '<blockquote><p>' + inline(line.replace(/^>\\s?/, "")) + '</p></blockquote>';
          continue;
        }

        const unordered = line.match(/^\\s*-\\s+(.+)$/);
        const ordered = line.match(/^\\s*\\d+\\.\\s+(.+)$/);
        if (unordered || ordered) {
          flushParagraph();
          const type = unordered ? "ul" : "ol";
          if (list && list !== type) closeList();
          if (!list) {
            list = type;
            html += '<' + type + '>';
          }
          html += '<li>' + inline((unordered || ordered)[1]) + '</li>';
          continue;
        }

        paragraph.push(line.trim());
      }

      if (code) html += '<pre><code>' + escapeHtml(code.lines.join("\\n")) + '</code></pre>';
      closeSection();
      return { html, headings };
    }

    const parsed = parseMarkdown(md);
    article.innerHTML = parsed.html;
    document.getElementById("chapterCount").textContent = article.querySelectorAll(".chapter").length;

    toc.innerHTML = parsed.headings
      .filter(item => item.level <= 3)
      .map(item => '<a class="depth-' + item.level + '" href="#' + item.id + '">' + escapeHtml(item.text.replace(/^\\d+\\.\\s*/, "")) + '</a>')
      .join("");

    [...document.querySelectorAll("[data-match]")].forEach(link => {
      const target = parsed.headings.find(item => item.text.includes(link.dataset.match));
      if (target) {
        link.href = "#" + target.id;
      } else {
        link.hidden = true;
      }
    });

    const navLinks = [...toc.querySelectorAll("a")];
    const sections = [...article.querySelectorAll(".chapter")];

    const observer = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach(link => link.classList.toggle("active", link.getAttribute("href") === "#" + visible.target.id));
      const heading = visible.target.querySelector("h2");
      if (heading) currentSection.textContent = heading.textContent;
    }, { rootMargin: "-20% 0px -65% 0px", threshold: [0.05, 0.2, 0.6] });
    sections.forEach(section => observer.observe(section));

    window.addEventListener("scroll", () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = Math.max(0, Math.min(100, (scrollTop / height) * 100)) + "%";
    }, { passive: true });

    search.addEventListener("input", () => {
      const query = search.value.trim().toLowerCase();
      let visible = 0;
      sections.forEach(section => {
        const match = !query || section.textContent.toLowerCase().includes(query);
        section.classList.toggle("is-hidden", !match);
        if (match) visible += 1;
      });
      empty.classList.toggle("show", visible === 0);
    });

    (async () => {
      const blocks = [...document.querySelectorAll(".mermaid")];
      if (!blocks.length) return;
      try {
        const mermaid = await import("https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs");
        mermaid.default.initialize({
          startOnLoad: false,
          theme: "base",
          themeVariables: {
            fontFamily: "Source Sans 3, sans-serif",
            primaryColor: "#dff1ea",
            primaryTextColor: "#23231f",
            primaryBorderColor: "#107d6f",
            lineColor: "#576158",
            secondaryColor: "#f4ded6",
            tertiaryColor: "#fffffb"
          }
        });
        await mermaid.default.run({ nodes: blocks });
      } catch (error) {
        blocks.forEach(block => {
          block.outerHTML = '<pre><code>' + block.textContent + '</code></pre>';
        });
      }
    })();
  </script>
</body>
</html>
`;

writeFileSync(outputPath, html, "utf8");
console.log(outputPath);
