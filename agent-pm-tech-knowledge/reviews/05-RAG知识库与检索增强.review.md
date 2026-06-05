# Review: 05 - RAG 知识库与检索增强

## Overall verdict: Pass

这份文档达到「强技术型 Agent 产品经理读完后达到 80% 面试可用理解」标准。它覆盖了 RAG 从数据入库、解析、chunk、embedding、向量库、召回、rerank、上下文组装、引用、更新、权限到评测的完整产品链路，并且持续把技术点连接到 PM 决策、风险、指标和 GTM / Sales Agent 场景。

主要不足不是基础缺失，而是几处可以进一步增强生产级可信度和当前性：引用资料没有标注访问日期/版本，Agentic RAG 只在面试问答中简述，缺少 multimodal / structured RAG 的独立处理，以及对检索评测标注方法和线上观测闭环还可以更具体。

## Score table

| Dimension | Score | Rationale |
|---|---:|---|
| Coverage | 5 | 覆盖 RAG 主链路和关键概念非常完整，包括 ingestion、chunk、embedding、vector store、hybrid search、rerank、context packing、citation、freshness、ACL、eval。 |
| PM relevance | 5 | 每个技术点基本都落回 PM 决策：何时用、何时不用、MVP 范围、成本延迟、权限、引用体验、指标和业务价值。 |
| Technical correctness | 4 | 总体准确，RAG vs 长上下文/微调/搜索工具的边界清晰；但部分“OpenAI Retrieval”表述可能受 API 文档演进影响，需要确认当前官方命名和能力描述。 |
| Interview usefulness | 5 | 有 17 个高频问答、30 秒/2 分钟表达、产品设计题答法，足够支撑面试表达。 |
| Practical examples | 5 | GTM / Sales / Marketing Agent 示例完整，包含知识源、入库 metadata、在线流程、输出结构、风险、评测和面试表达。 |
| Structure and readability | 5 | 结构符合标准，层级清晰，表格和面试表达帮助复习；篇幅较长但可扫描性好。 |
| Source quality | 4 | 引用了 OpenAI、LangChain、LlamaIndex、Pinecone、Qdrant、Weaviate、Milvus、Cohere、Ragas、TruLens 和论文，来源质量高；但缺少访问日期、版本说明，也没有说明哪些能力来自哪一版文档。 |

Overall score: 4.7 / 5

## Top issues ranked by severity

1. **Source freshness and exact product naming need verification**
   - Severity: Medium
   - The document cites OpenAI Retrieval, File Search, vector stores, embeddings, and model pages. Because OpenAI API docs and product names change quickly, the document should verify and pin current names/capabilities.
   - Risk: Interview or product discussion中如果说到已改名或能力边界变化的 API，可信度会下降。

2. **Agentic RAG coverage is useful but too brief**
   - Severity: Medium
   - Agentic RAG appears mainly in Q16 and build-vs-buy notes. For Agent PM audience, it deserves a small subsection under "How it works" or "Tradeoffs".
   - Missing angle: when agent should iterate retrieval, when to stop, how to control tool loops, cost, latency, and eval complexity.

3. **Structured data and SQL/API retrieval boundary could be sharper**
   - Severity: Medium
   - The doc mentions CRM/API and structured data, but it can more explicitly distinguish: facts like ARR, renewal date, owner, entitlement, order status should often come from APIs/SQL, not chunked vector retrieval.
   - Risk: PM might over-apply RAG to transactional or numeric facts where deterministic tools are safer.

4. **Multimodal and document-layout RAG is mentioned but not operationalized**
   - Severity: Low to Medium
   - PDF tables, OCR, charts and screenshots are mentioned in parsing, but the document does not describe when to use OCR, table extraction, multimodal embeddings, layout-aware parsing, or source image/page citations.
   - This is increasingly relevant for enterprise docs, decks, contracts, screenshots and sales collateral.

5. **Evaluation section is strong but could add labeling/acceptance thresholds**
   - Severity: Low
   - Metrics are broad and correct, but the PM would benefit from sample acceptance criteria: e.g. citation accuracy target, filter accuracy must be 100% for permissions, p95 latency goal, minimum recall@k for launch.

## Missing topics

- Agentic RAG lifecycle: retrieve-plan-act-reflect loops, stopping criteria, loop budget, fallback to user clarification.
- Graph RAG / relationship-aware retrieval at a high level, especially for account-contact-opportunity relationships in GTM systems.
- Structured retrieval boundary: RAG vs SQL/API/tool calling for exact, current, numeric, permission-sensitive records.
- Multimodal/layout-aware RAG: OCR, table extraction, page-level citations, chart/image handling, slide decks.
- Query routing: deciding between internal RAG, external web search, CRM API, long-context document read, or no retrieval.
- Data governance: PII retention, deletion propagation, source trust levels, audit retention, data residency.
- Launch gates and thresholds: what metric level is good enough for MVP vs production.
- Human-in-the-loop workflows: SME correction, feedback triage, knowledge gap reporting, citation dispute handling.

## Suggested edits

1. Add a short subsection after `4.11 权限过滤`:
   - Title: `4.12 Agentic RAG：让 Agent 决定何时继续检索`
   - Cover: query planning, multi-hop retrieval, source routing, evidence sufficiency check, max retrieval rounds, loop/cost budget, refusal/clarification.

2. Add a note in `6.4 RAG vs 搜索工具` or a new tradeoff:
   - Title: `RAG vs SQL/API`
   - Message: vector retrieval is for unstructured evidence; APIs/SQL are better for exact current fields like renewal date, ARR, entitlement, user permissions, order state.

3. Strengthen `8.6 评测流程` with launch thresholds:
   - Example: permission filter accuracy must be 100%; citation support should be separately sampled; p95 latency and per-answer cost need target ranges; high-risk domains require human review.

4. Add 3-5 bullets under parsing or retrieval for multimodal/layout-heavy docs:
   - OCR quality checks, table-aware parsing, preserving page/row/column coordinates, citations to page or table cell, fallback when images cannot be interpreted.

5. Improve references:
   - Add "accessed on 2026-06-04" or version notes for fast-changing docs.
   - Check whether OpenAI "Retrieval" and "File Search" pages are still the current canonical docs and update names if needed.

6. Add one interview Q&A:
   - Question: "什么时候应该用 API/SQL 而不是 RAG?"
   - Answer: exact transactional facts and permission-critical records should come from deterministic tools; RAG should provide unstructured evidence and explanatory context.

## 是否达到 80% 面试可用理解

Yes. A strong technical Agent PM reading this document should be able to:

- Explain what RAG is and why it matters.
- Draw the offline ingestion and online retrieval/generation flow.
- Discuss chunking, embedding, vector stores, hybrid search, rerank, metadata, permissions and citations at PM depth.
- Make product tradeoffs between RAG, long context, search tools, SQL/API tools and fine-tuning.
- Define an MVP and meaningful evaluation metrics.
- Answer common interview questions with concrete GTM / Sales Agent examples.

The document does not need full revision before use. It should receive a targeted polish pass for source freshness, Agentic RAG, structured retrieval boundaries, multimodal docs and launch thresholds.

## Must-change checklist

Because verdict is **Pass**, there are no blocking must-change items.

Recommended before publishing:

- [ ] Verify current OpenAI RAG/File Search/vector store/embedding docs and update naming if needed.
- [ ] Add a brief Agentic RAG subsection.
- [ ] Add explicit RAG vs SQL/API guidance.
- [ ] Add launch/evaluation thresholds for permissions, citation support, latency and cost.
- [ ] Add access dates or version notes to fast-changing references.
