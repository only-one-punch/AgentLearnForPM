# Review: 01-LLM基础

Review date: 2026-06-04

Target file: `/Users/zhangqingquan/Documents/JustDoIt/agent-pm-tech-knowledge/01-LLM基础.md`

Quality standard: `/Users/zhangqingquan/Documents/JustDoIt/agent-pm-tech-knowledge/QUALITY-STANDARD.md`

## Overall verdict: Pass

This document meets the quality bar for a strong technical Agent PM. It covers LLM fundamentals broadly, repeatedly connects the concepts to Agent product decisions, and gives interview-ready language around capability boundaries, context design, structured output, hallucination, RAG vs fine-tuning, model routing, cost, latency, eval, and human confirmation.

The document is especially strong as a PM-facing foundation: it does not drift into model-training internals, and it consistently translates technical ideas into MVP scope, UX trust, cost control, and GTM / Sales Agent decisions. A reader should be able to answer most common LLM foundation interview questions after studying it.

## Score table

| Dimension | Score | Rationale |
|---|---:|---|
| Coverage | 5 | Covers token, context window, prompt, roles, randomness, structured output, reasoning models, multimodal, hallucination, fine-tuning, embedding, RAG, long context, prompt caching, model routing, metrics, examples, interview answers, and references. |
| PM relevance | 5 | Strongly maps technical choices to product boundaries, MVP scope, cost, latency, user trust, evidence requirements, human-in-the-loop, and business viability. |
| Technical correctness | 4 | Core framing is accurate and current. Minor precision issues should be cleaned up around hidden reasoning / intermediate content, temperature determinism, and source freshness. |
| Interview usefulness | 5 | Includes high-frequency questions, concise recommended answers, interview phrasing, and clear PM vocabulary. It is highly studyable. |
| Practical examples | 4 | GTM / Sales Agent examples are frequent and useful. They could be slightly stronger with a more concrete end-to-end sample request, output, eval dataset, and launch gate. |
| Structure and readability | 5 | Follows the required module structure closely, with clear headings, bullets, examples, and a useful memory summary. |
| Source quality | 4 | Uses relevant official sources from OpenAI, Anthropic, and Claude Code. Link hygiene needs improvement because several OpenAI links redirect and one API reference URL returned 403 during a light check. |

Overall average: 4.6 / 5

## Top issues ranked by severity

1. **Minor technical precision issue around reasoning / intermediate content.**
   The context window section says context may include "部分模型的推理或中间内容". This can confuse PM readers because hidden reasoning tokens or internal reasoning traces are not the same as ordinary prompt context the PM can inspect or place into the request. Reword to distinguish visible input context from provider-managed reasoning tokens, traces, or summaries.

2. **Reference links need cleanup for freshness and auditability.**
   Several OpenAI documentation links redirect from `platform.openai.com/docs/...` to `developers.openai.com/api/docs/...`. The Responses API reference link returned 403 in a lightweight `curl` check, likely due to access behavior rather than necessarily dead content. This is not a blocker, but citations should be normalized to current official URLs.

3. **Model selection guidance is good but could become more operational.**
   The document explains strong vs small models and routing well, but an interview-ready PM would benefit from a compact task-to-model decision table: extraction, classification, summarization, multi-step reasoning, customer-facing copy, tool execution planning, and verification.

4. **Evaluation section lists metrics but could add a concrete mini eval design.**
   The metrics are useful, but the document would be stronger with a small GTM Agent eval dataset example: 50 accounts, expected fields, evidence labels, hallucination checks, accepted answer criteria, and go/no-go thresholds.

5. **Practical example could include one end-to-end trace.**
   The Sales Agent case is relevant, but it would be more vivid if it showed one concrete flow from user request to retrieved evidence to structured output to human approval.

## Missing topics

- Clear distinction between visible context, hidden reasoning tokens, reasoning summaries, and logs/traces.
- A compact model-routing decision matrix by task type, risk, latency, and cost.
- Concrete eval dataset design for LLM foundation quality in the Sales Agent case.
- Example launch gates beyond the current metrics, such as schema validity, evidence coverage, hallucination rate, P95 latency, and cost per accepted lead brief.
- Short note on deterministic controls: low temperature can improve consistency, but does not guarantee determinism or correctness.
- Citation cleanup to current official OpenAI / Anthropic URLs.

## Suggested edits

1. In the context window section, replace the line about reasoning/intermediate content with:
   > Some providers may expose reasoning summaries, traces, or charge for reasoning tokens, but PMs should distinguish these from visible request context that the application explicitly sends to the model.

2. Add a small model-routing table:

   | Task | Default model choice | Reason |
   |---|---|---|
   | Simple classification / extraction | Fast low-cost model | High volume, low risk |
   | Long evidence synthesis | Stronger model or long-context model | Needs cross-source judgment |
   | Buying-signal scoring | Strong model plus evidence constraints | Higher business impact |
   | Final customer-facing copy | Strong model plus human review | Brand and trust risk |
   | Output validation | Small model or rules | Cheap second pass |

3. Add a concrete mini eval design for the Sales Agent:
   - 50-100 labeled target accounts.
   - Required fields: company facts, decision maker, buying signal, evidence URL, confidence, outreach reason.
   - Human labels for factual accuracy, evidence support, usefulness, and unsafe claims.
   - Track schema validity, evidence-backed field rate, hallucination rate, sales acceptance rate, P95 latency, and cost per accepted brief.

4. Add launch gate examples:
   - Schema validity >= 98%.
   - Evidence-backed key fields >= 90%.
   - Critical hallucination rate <= 2%.
   - Sales acceptance rate >= 30%.
   - P95 latency and cost stay within the MVP budget.
   - 100% of external sends require human approval in MVP.

5. Add one end-to-end Sales Agent trace:
   user ICP input -> search / CRM retrieval -> evidence snippets -> structured JSON -> confidence -> sales approval / rejection feedback.

6. Normalize references to current official URLs and remove or replace any link that requires authentication or returns 403 in simple checks.

## Does it reach 80% interview-ready understanding?

**Yes.**

This document reaches the 80% interview-ready standard. A strong technical Agent PM who reads it should be able to explain LLM fundamentals, discuss product and engineering tradeoffs, define MVP scope, propose evaluation metrics, diagnose common quality failures, and answer common interview questions with credible Agent product language.

## Must-fix checklist for Pass

No mandatory fixes are required for Pass.

Recommended improvements:

- [ ] Clarify visible context vs hidden reasoning / traces / reasoning tokens.
- [ ] Normalize redirected or access-limited reference links.
- [ ] Add a task-based model-routing decision table.
- [ ] Add a concrete mini eval dataset and launch gate for the GTM / Sales Agent.
- [ ] Add one end-to-end Sales Agent trace from input to evidence-backed structured output.
- [ ] Add a short caveat that low temperature improves stability but does not guarantee correctness or full determinism.
