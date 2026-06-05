# Review: 02-Agent基础

Review date: 2026-06-04

Target file: `/Users/zhangqingquan/Documents/JustDoIt/agent-pm-tech-knowledge/02-Agent基础.md`

Quality standard: `/Users/zhangqingquan/Documents/JustDoIt/agent-pm-tech-knowledge/QUALITY-STANDARD.md`

## Overall verdict: Pass

This document reaches the intended standard for a strong technical Agent PM. It explains Agent fundamentals in a product-relevant way, clearly distinguishes Agent from Chatbot, Copilot, Workflow, and Automation, and gives the reader enough vocabulary, examples, metrics, risks, and interview phrasing to handle common Agent PM interviews.

The document is not merely conceptual. It repeatedly maps technical concepts to PM decisions: when to use an Agent, how much autonomy to allow, what tools and memory should be permitted, when to require human confirmation, what failure modes matter, and how to evaluate production readiness. The GTM Account Research Agent example is concrete and useful.

## Score table

| Dimension | Score | Rationale |
|---|---:|---|
| Coverage | 5 | Covers definition, core components, agent loop, autonomy levels, comparison with adjacent product patterns, capabilities, boundaries, PM depth, tradeoffs, failure modes, metrics, examples, interview answers, and references. |
| PM relevance | 5 | Strongly connects technical concepts to MVP scope, user trust, permissions, human-in-the-loop, business value, risk control, and product metrics. |
| Technical correctness | 4 | Core technical framing is accurate and current. Minor precision improvements are possible around autonomy levels, memory taxonomy, and "planning" wording, but no major factual error was found. |
| Interview usefulness | 5 | Includes high-frequency Q&A, 30-second and 2-minute interview scripts, and practical talking points. A reader should be able to answer most foundational Agent PM questions. |
| Practical examples | 5 | GTM / Sales example is specific, end-to-end, and tied to CRM, ICP, buying signals, evidence, approval, MVP scope, metrics, and risks. |
| Structure and readability | 5 | Follows and slightly expands the required section structure. Tables, bullets, examples, and summaries make it easy to study and review. |
| Source quality | 4 | Uses mostly reliable official sources: OpenAI, Anthropic, LangChain/LangGraph, MCP, Salesforce, OWASP, and NIST. Link check found no dead URLs; a few links return redirects and could be normalized. |

Overall average: 4.7 / 5

## Top issues ranked by severity

1. **Autonomy-level taxonomy may be read as too canonical.**
   The L0-L5 scale is useful for PM thinking, but it is not presented as a widely standardized industry taxonomy. Add one sentence saying this is a product framing model rather than a formal standard.

2. **The document could more explicitly separate "Agent planning" from hidden chain-of-thought.**
   It correctly says full reasoning should not necessarily be shown, but interview readers would benefit from sharper wording: expose plans, step status, rationale summaries, evidence, and next actions, not private chain-of-thought.

3. **Source-to-claim mapping is broad rather than local.**
   The reference list is strong, but fast-changing claims about OpenAI Agent evals, trace grading, MCP tools, and LangGraph persistence would be more audit-friendly if a few sections had inline source notes.

4. **Memory taxonomy is strong but could add retention and governance defaults.**
   The document mentions visibility, deletion, expiration, and privacy, but a PM interview answer would be stronger with a tiny default policy: user memory opt-in or editable; org memory admin-governed; sensitive data not remembered by default; memory changes logged.

5. **MVP launch gates could be made more concrete.**
   Metrics are comprehensive, but the GTM Agent MVP section would be stronger with example go/no-go thresholds such as evidence accuracy, unauthorized action count, trace coverage, approval coverage, and cost per successful research brief.

## Missing topics

- Explicit note that the autonomy scale is a PM model, not a formal universal standard.
- Concrete launch-readiness gates for the GTM Agent MVP.
- A compact permission tier table for tools: read-only, draft/suggest, low-risk write, external-send, destructive/sensitive.
- More explicit memory governance defaults: opt-in, edit/delete, TTL, tenant isolation, audit logs, and sensitive-data exclusions.
- Inline source notes near fast-changing framework/provider claims.
- More examples of "ask for clarification vs proceed with assumptions" for ambiguous goals.

## Suggested edits

1. After the L0-L5 autonomy table, add:
   > This is a PM-facing autonomy scale, not a formal industry standard. Its purpose is to help teams decide the minimum useful autonomy for a task.

2. In the planning section, add:
   > Product UI should expose plan summaries, step status, evidence, assumptions, and next actions, but should not rely on displaying private chain-of-thought as the trust mechanism.

3. Add a tool permission tier table:

   | Tier | Examples | Default PM policy |
   |---|---|---|
   | Read-only | Search CRM, read docs, web search | Usually safe with ACL filtering and logging |
   | Draft/suggest | Email draft, CRM note draft | User edits before use |
   | Low-risk write | Create task, save note | Batch confirmation or admin policy |
   | External-send | Send email, notify customer | Human approval by default |
   | Sensitive/destructive | Refund, delete, permission change | Avoid in MVP or require strict approval |

4. Add a GTM MVP launch gate example:
   - Evidence accuracy meets the agreed threshold on a golden dataset.
   - 100% of CRM writes and external sends require approval in MVP.
   - 0 critical unauthorized tool actions in red-team tests.
   - Trace logging covers model calls, retrieval, tool calls, user approvals, and write operations.
   - Cost per accepted account brief is below the target business threshold.

5. Add one short paragraph in the memory section:
   > Default memory policy should be conservative: remember stable preferences only with visibility and edit/delete controls; keep sensitive, temporary, or inferred attributes out of long-term memory unless there is explicit product and compliance justification.

6. Normalize redirected links where possible. During review, several URLs returned redirects rather than dead links, including some OpenAI guide pages and the Anthropic tool-use docs. This is not a blocker, but cleanup would improve citation hygiene.

## Does it reach 80% interview-ready understanding?

**Yes.**

A strong technical Agent PM who reads this document should reach at least 80% interview-ready understanding of Agent fundamentals. They should be able to define Agent, distinguish it from Chatbot/Copilot/Workflow/Automation, explain the core system components, discuss autonomy and permission tradeoffs, describe common risks, propose GTM Agent MVP scope, define metrics, and answer high-frequency interview questions with credible product and technical language.

## Must-fix checklist for Pass

No mandatory fixes are required for Pass.

Recommended improvements:

- [ ] Clarify that the autonomy ladder is a PM framing model.
- [ ] Add concrete GTM MVP launch gates.
- [ ] Add tool permission tiers.
- [ ] Add conservative default memory governance.
- [ ] Add a few inline source notes for fast-changing framework/provider claims.
- [ ] Normalize redirected reference URLs where practical.
