# Review: 00-Agent-PM-技术知识总览

Review date: 2026-06-04

Target file: `/Users/zhangqingquan/Documents/JustDoIt/agent-pm-tech-knowledge/00-Agent-PM-技术知识总览.md`

Quality standard: `/Users/zhangqingquan/Documents/JustDoIt/agent-pm-tech-knowledge/QUALITY-STANDARD.md`

## Overall verdict: Needs Revision

This is a strong, broad, and PM-oriented overview. It gives the reader a coherent Agent product map across LLM, Agent, tool calling, RAG, memory, workflow, multi-agent, eval, cost, safety, and productization. The GTM / Sales Agent example is consistent and useful, and the interview language is much better than generic AI notes.

However, under the stated standard of "a strong technical Agent PM reaches 80% interview-ready understanding after reading it," the document is not fully there yet as a standalone overview. It is broad enough, but several sections remain too compressed for likely interview follow-ups: current model/platform choices, agent runtime state, ownership boundaries, launch gates, versioning, rollout, observability detail, and failure recovery. Source quality is mostly good, but validation found one OpenAI platform link returning 403 and one OpenAI Agents guide check timing out; this should be cleaned up or replaced with consistently accessible official URLs.

## Score table

| Dimension | Score | Rationale |
|---|---:|---|
| Coverage | 4 | Covers nearly all required modules, but leaves some important production/interview topics thin: ownership map, release gates, versioning, rollout, state lifecycle, and observability architecture. |
| PM relevance | 5 | Strongly connects technical modules to product scope, trust, risk, metrics, MVP boundaries, and enterprise adoption. |
| Technical correctness | 4 | Core concepts are accurate and current in spirit. Minor precision gaps around MCP positioning, memory implementation choices, agent orchestration/state, and source-link validation. |
| Interview usefulness | 4 | Good Q&A and answer templates, but some answers are first-pass rather than strong technical PM depth; likely follow-up questions would expose missing details. |
| Practical examples | 4 | GTM/Sales Agent example is coherent and repeated throughout. It needs one deeper end-to-end scenario with concrete inputs, outputs, eval cases, permission gates, and failure handling. |
| Structure and readability | 4 | Easy to scan, well organized, and suitable as a map. Because it is very broad, some sections read like checklists and need sharper prioritization for exam/interview study. |
| Source quality | 3 | Mostly reliable official or high-quality sources. During review, most links were reachable, but `https://platform.openai.com/docs/api-reference/responses` returned 403 and `https://developers.openai.com/api/docs/guides/agents` timed out in one validation pass. Several claims would benefit from closer source-to-claim anchoring. |

Overall average: 4.0 / 5

## Top issues ranked by severity

1. **The document is broad but not yet deep enough for "80% interview-ready" as a standalone text.**
   The reader can explain the Agent landscape, but may struggle when an interviewer asks for concrete design thresholds, implementation boundaries, state management, launch criteria, or tradeoffs between frameworks/providers. A total overview can be lighter than module docs, but the current standard explicitly asks for interview-ready understanding.

2. **Missing production ownership and system-boundary map.**
   The 12-layer model is useful, but it does not say which layers are usually owned by product frontend, product backend, orchestration runtime, model provider, data/search infra, IAM/security, observability/eval tooling, or customer admin controls. Strong technical PM interviews often test whether the candidate can communicate cleanly with those owners.

3. **Launch readiness is discussed conceptually but lacks concrete gates.**
   The document lists eval metrics, safety controls, and rollout stages, but does not provide a crisp "do not launch unless..." checklist for the GTM Agent MVP. This weakens practical PM usefulness.

4. **Observability and state lifecycle are under-specified.**
   Trace is mentioned often, but the document does not clearly distinguish run state, conversation state, workflow state, task memory, user/team/org memory, audit logs, retention, replay, and debugging. These concepts matter for production Agent products and for technical interviews.

5. **Source validation and source mapping need cleanup.**
   Most sources are good, but at least one official OpenAI link returned 403 in validation and one official Agents guide timed out. Also, some framework/platform claims are stated without nearby references, making it harder to audit current accuracy.

6. **The overview references `01-LLM基础.md`, but that file is not present in the current directory listing.**
   This may be a sequencing or generation issue outside this document, but the recommended reading path currently points to a missing file. For a knowledge base overview, broken internal navigation should be fixed or explained.

## Missing topics

- Ownership map: product UI, application backend, orchestration runtime, tool integrations, model provider, vector/search infra, IAM/security, eval/observability, admin console.
- Agent state lifecycle: run state, task state, workflow state, short-term context, long-term memory, audit events, retention/TTL, deletion, and replay.
- Versioning and regression: prompt version, model version, tool schema version, retrieval index version, eval set version, rollout gates.
- Launch-readiness checklist for the GTM Agent MVP: eval thresholds, red-team pass criteria, approval coverage, trace coverage, fallback behavior, rollback path, cost budget.
- Framework/provider tradeoff map: when to use provider-native Agents/Responses, LangGraph, LlamaIndex, Dify/n8n/Coze-style builders, or custom app orchestration.
- Tool execution reliability: idempotency, dry run, confirmation screens, write conflict handling, retry policy, compensating actions, and rollback.
- RAG data governance depth: ACL-aware retrieval, stale data handling, source freshness, tenant isolation, and citation verification.
- Prompt/product interface: system instruction boundaries, user-configurable policies, prompt templates, and how PMs should specify behavior without hardcoding brittle prompts.
- Concrete interview follow-up examples: "what would you measure before beta?", "how do you debug a bad answer?", "what happens when CRM is down?", "how do you prevent a poisoned webpage from controlling the Agent?"

## Suggested edits

1. Add a "production ownership map" after the 12-layer table:

   | Layer | Typical owner | PM decision |
   |---|---|---|
   | UX / approval surfaces | Product + frontend | How users set goals, inspect evidence, edit, approve, recover |
   | Orchestration | App backend / agent framework | Workflow vs agent loop, state, retries, interrupts |
   | Tools | Backend / integrations | Schema, permissions, idempotency, audit |
   | Knowledge / RAG | Data/search team | Sources, ACL, freshness, citations, eval |
   | Safety / IAM | Security/platform | Least privilege, policy, DLP, tenant isolation |
   | Eval / observability | Platform + product analytics | Trace coverage, quality gates, regression, cost monitoring |

2. Add a GTM Agent launch gate checklist:
   - Golden set covers at least account research, email drafting, CRM writeback, unsafe external content, and permission-denied cases.
   - 100% of write tools produce traceable tool name, parameters, actor, timestamp, and result.
   - External send and important CRM writes require human approval in MVP.
   - No critical unauthorized actions in red-team tests.
   - Citation support rate and evidence relevance meet an agreed threshold before beta.
   - Cost per successful account brief and p95 completion time fit the business case.
   - Safe fallback exists when CRM, search, or RAG is unavailable.

3. Add a state lifecycle table:

   | State type | Example | Product requirement |
   |---|---|---|
   | Run state | Current Agent step and tool output | Traceable, replayable for debugging |
   | Workflow state | Pending approval, sent, failed | Durable, recoverable, auditable |
   | Conversation state | Current user instructions | Session scoped, not treated as permanent memory |
   | User memory | Preferred email tone | Visible, editable, deletable |
   | Account memory | Prior objections for Acme | Source-linked, permission-filtered, time-stamped |

4. Expand the interview Q&A with 4-6 harder follow-ups:
   - "How do you debug an Agent that gives a polished but wrong answer?"
   - "How do you decide the Agent can write to CRM?"
   - "How do you design eval before there is much production data?"
   - "How would you handle prompt injection from a webpage?"
   - "When would you choose workflow over multi-agent?"
   - "What launch gates would you use for enterprise beta?"

5. Add a compact framework/provider comparison:
   - Provider-native APIs for simple tool calling, structured output, and fast prototyping.
   - LangGraph-style orchestration for explicit state, interrupts, and complex flows.
   - LlamaIndex-style stack for data/RAG-heavy knowledge products.
   - n8n/Dify/Coze-style builders for workflow automation and faster internal tools.
   - Custom orchestration when permissions, compliance, latency, or deep product integration dominate.

6. Clean up source hygiene:
   - Re-validate all URLs on or after 2026-06-04.
   - Replace or supplement URLs that return 403/time out with accessible official documentation pages.
   - Add short source notes near claims about Anthropic workflow vs agent, OpenAI tool calling/Agents/Responses, MCP, LangGraph multi-agent, LlamaIndex RAG/eval, OWASP risks, and NIST governance.

7. Fix internal navigation:
   - Add `01-LLM基础.md` if it is intended to exist, or update the reading path to match the actual file set.

## Does it reach 80% interview-ready understanding?

**Not yet as a standalone document.**

The document likely gets a reader to roughly 70-75% interview-ready understanding: they can explain the technical landscape, describe a GTM Agent architecture, discuss major tradeoffs, and answer common first-level questions. To reach the stated 80% bar for a strong technical Agent PM, it needs more production-grade specificity: ownership boundaries, state lifecycle, launch gates, deeper eval examples, tool execution reliability, source cleanup, and harder interview follow-ups.

## Must-fix checklist for Pass

- [ ] Add a production ownership map that connects each technical layer to likely engineering/platform/security owners and PM decisions.
- [ ] Add concrete GTM Agent MVP launch gates with quality, safety, trace, approval, cost, latency, and fallback criteria.
- [ ] Add state lifecycle coverage: run state, workflow state, conversation state, memory, audit log, retention, deletion, replay.
- [ ] Add versioning/regression coverage for prompts, models, tool schemas, RAG indexes, and eval sets.
- [ ] Add deeper tool reliability controls: idempotency, dry run, confirmation, retry, rollback/compensation, write conflict handling.
- [ ] Expand interview Q&A with harder production follow-ups and stronger sample answers.
- [ ] Re-validate and clean source links, especially OpenAI links that returned 403 or timed out during review.
- [ ] Add clearer source anchors for fast-changing framework/provider claims.
- [ ] Fix the missing or mismatched `01-LLM基础.md` reference in the recommended reading path.
