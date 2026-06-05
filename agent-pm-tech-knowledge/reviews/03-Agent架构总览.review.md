# Review: 03-Agent架构总览

Review date: 2026-06-04

Target file: `/Users/zhangqingquan/Documents/JustDoIt/agent-pm-tech-knowledge/03-Agent架构总览.md`

Quality standard: `/Users/zhangqingquan/Documents/JustDoIt/agent-pm-tech-knowledge/QUALITY-STANDARD.md`

## Overall verdict: Needs Revision

This is a strong and mostly interview-ready architecture overview. It covers the core Agent system layers, explains PM-facing tradeoffs, includes GTM/Sales examples, and gives usable interview language. However, the quality standard explicitly says missing or problematic references must be flagged for revision. At least one cited source URL is a confirmed 404, and several fast-changing source claims would benefit from tighter citation hygiene. Because of that, the document should be revised before being marked Pass.

## Score table

| Dimension | Score | Rationale |
|---|---:|---|
| Coverage | 5 | Broadly covers model, context, tools, knowledge, memory, orchestration, eval, safety, observability, UX, and GTM example. |
| PM relevance | 5 | Consistently connects architecture to MVP scope, permissions, risk, trust, metrics, and product tradeoffs. |
| Technical correctness | 4 | Core concepts are accurate. Minor risk around current OpenAI/LlamaIndex/LangGraph product/API phrasing and URLs, but no major conceptual error found. |
| Interview usefulness | 5 | Strong Q&A section plus 30-second, 2-minute, and advanced interview scripts. Reader can answer common architecture questions. |
| Practical examples | 5 | GTM/Sales Agent example is concrete, end-to-end, and tied to tools, RAG, memory, safety, metrics, and MVP boundaries. |
| Structure and readability | 5 | Follows the required section structure, uses tables and diagrams well, and is easy to review. |
| Source quality | 3 | Sources are mostly reliable, but one LlamaIndex reference is confirmed dead and one OpenAI platform URL was blocked in validation. Needs link cleanup and more precise source mapping. |

Overall average: 4.6 / 5

## Top issues ranked by severity

1. **Confirmed dead reference weakens source-quality compliance.**
   The reference `https://docs.llamaindex.ai/en/logan-material_docs/use_cases/agents/` returned HTTP 404 during review. The quality standard says missing references must be flagged for revision, so this alone prevents a clean Pass.

2. **Some references are reliable brands but not tightly mapped to claims.**
   The document cites OpenAI, Anthropic, LangGraph, LlamaIndex, MCP, and OWASP, but several sections make product/API-specific statements without nearby citation anchors. For an interview-prep technical knowledge base, this is acceptable for readability, but weaker for auditability. Examples: OpenAI Responses/Agents SDK positioning, trace grading, LangGraph checkpoint claims, and LlamaIndex multi-agent pattern taxonomy.

3. **Architecture map is broad, but could better distinguish system architecture from deployment/ownership architecture.**
   The ten-layer map is useful, but a strong technical PM may still need a clearer mental model of what is usually owned by product app code, agent framework/runtime, model provider, data platform, security/IAM, and observability stack. This is not a fatal gap, but adding it would improve engineering conversation readiness.

4. **Failure-mode and metrics sections are strong but could include more explicit release gates.**
   The document lists metrics and evaluation methods, but does not give a crisp example of "do not launch unless X passes." Interview usefulness would improve with concrete launch/readiness thresholds for the GTM Agent MVP.

5. **Tool-risk taxonomy could be sharper.**
   The safety section explains excessive agency, least privilege, approval, and audit logs well. It could further distinguish read-only tools, draft/write tools, external-send tools, destructive tools, and financial/legal/compliance-sensitive tools. This would help PMs reason about permissioning and approval design.

## Missing topics

- A concise "ownership map": which layers usually sit in frontend/product backend, orchestration runtime, model provider, vector/search infrastructure, IAM/security, analytics/eval tooling.
- Launch-readiness checklist for an Agent MVP: required traces, eval coverage, red-team cases, fallback behavior, approval flows, cost budgets, rollback plan.
- Clearer tool permission tiers: read, suggest/draft, write low-risk, external-send, destructive/high-risk.
- More explicit state lifecycle: run state, conversation state, task state, user/team/org memory, retention/TTL, deletion, and audit policy.
- Versioning and rollout mechanics: prompt version, model version, tool schema version, knowledge index version, eval regression before deploy.
- Data freshness and permission filtering in RAG/search: tenant isolation, ACL-aware retrieval, stale-index handling.
- Explicit fallback and escalation patterns: ask user, retry, route to human, partial completion, safe abort.

## Suggested edits

1. Replace the dead LlamaIndex agents reference with a currently valid official LlamaIndex agent documentation URL. Keep the existing valid multi-agent reference if it remains current.

2. For source hygiene, add short source notes near claims such as:
   - Anthropic workflow vs agent distinction.
   - OpenAI Responses API / Agents SDK / eval / trace-grading capabilities.
   - LangGraph persistence / checkpoint / interrupt behavior.
   - OWASP LLM Top 10 risk categories.

3. Add a small table after the ten-layer architecture map:

   | Layer | Typical owner | PM decision |
   |---|---|---|
   | Product UI | Product/frontend | Where users configure, approve, edit, recover |
   | Orchestration | App/backend or framework | Workflow vs agent loop, retries, state |
   | Tools | Backend/integration team | Permissions, schema, idempotency, audit |
   | Data/RAG | Data/search team | Sources, ACL, freshness, citations |
   | Safety/IAM | Security/platform | Least privilege, approval, policy |
   | Eval/Observability | Platform/product analytics | Trace, quality gates, regression |

4. Add a GTM Agent launch gate example:
   - Evidence accuracy >= target threshold on golden set.
   - 0 critical unauthorized tool actions in red-team tests.
   - 100% trace coverage for model, retrieval, and write tools.
   - External send and CRM critical-field writes require approval.
   - Cost per successful account brief below agreed business threshold.

5. Add a short "permission tier" table for tools:
   - Read-only: search CRM, read docs.
   - Draft/suggest: generate email, prepare CRM note.
   - Low-risk write: create task, save draft.
   - High-risk write/send: update opportunity stage, send email.
   - Destructive/sensitive: delete data, change permissions, pricing/contract actions.

6. Add one paragraph clarifying that "multi-agent" can be implemented as explicit workflow nodes, orchestrator-calls-subagents-as-tools, handoff-based agents, or planner/executor patterns, and that the product question is accountability and evaluation, not just number of agents.

## Does it reach 80% interview-ready understanding?

**Almost yes, but not fully certified until references are fixed.**

For content and learning value, the document likely gets a strong technical Agent PM to 80% interview-ready understanding of Agent architecture. The reader should be able to explain the architecture, defend workflow vs agent vs multi-agent choices, define a GTM Agent MVP, discuss safety/observability/eval, and answer common interview questions.

The remaining gap is not basic comprehension; it is production-grade precision. Fixing references, adding ownership/launch-gate/tool-permission details, and tightening source mapping would make it clearly Pass.

## Must-fix checklist for Pass

- [ ] Replace the confirmed 404 LlamaIndex agents reference.
- [ ] Recheck all OpenAI, LangGraph, LlamaIndex, MCP, Anthropic, and OWASP URLs on 2026-06-04 or later.
- [ ] Add source anchors or short source notes for the most API/framework-specific claims.
- [ ] Add a tool permission tier table.
- [ ] Add an Agent MVP launch-readiness checklist or quality gate example.
- [ ] Add an ownership map showing which architecture layers PM should discuss with which engineering/platform/security counterparts.

