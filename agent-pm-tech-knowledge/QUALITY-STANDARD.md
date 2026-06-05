# Agent PM Technical Knowledge Quality Standard

## Goal

This knowledge base is for a strong technical Agent Product Manager / AI Native PM / Agent Builder PM.

The reader should not become a pure Agent engineer after reading it. The reader should reach about 80% interview-ready understanding: able to explain the concept, discuss product and engineering tradeoffs, define MVP scope and metrics, and answer common technical interview questions.

## Required Audience Fit

Every document must be written for an Agent PM who can build prototypes and talk with engineers, but does not want to own deep infrastructure implementation.

The document must connect technical concepts to product decisions, user experience, business value, risk, and interview expression.

## Required Document Sections

Each module document should include these sections unless the topic clearly requires a different structure:

1. What this module solves
2. Why an Agent PM must understand it
3. Core concept map
4. How it works
5. What depth a PM needs
6. Common product decisions and tradeoffs
7. Common failure modes
8. Metrics and evaluation methods
9. Keywords for engineering communication
10. High-frequency interview questions and answers
11. GTM / Sales / Marketing Agent example
12. How to say it in interviews
13. Quick memory summary
14. References

## Depth Standard

Each document should be broad and practical, not a narrow engineering deep dive.

Good:
- Explains the concept in plain language.
- Shows where it sits in an Agent product architecture.
- Describes common implementation options without becoming a coding tutorial.
- Explains product tradeoffs, failure boundaries, and metrics.
- Gives interview-ready language.

Bad:
- Only lists terms without explaining product relevance.
- Writes like a backend engineering manual.
- Gives generic AI content without Agent product context.
- Uses outdated assumptions without checking current reliable sources.
- Does not include a concrete GTM / Sales / Marketing Agent example.

## Freshness And Source Standard

For topics that change quickly, the thread must research current reliable sources before writing.

Prefer:
- Official OpenAI documentation
- Official Anthropic documentation
- LangGraph / LangChain documentation
- LlamaIndex documentation
- Dify, Coze, n8n official documentation
- OWASP, NIST, or similarly reliable security references
- Official vector database or evaluation framework documentation
- Recent primary or high-quality technical sources

The final document must include reference links. If a source is used only for general orientation, cite it briefly.

## Product Framing Standard

Each document should repeatedly answer:

- What product problem does this technical capability solve?
- When should a PM choose it?
- When should a PM avoid it?
- What user-visible experience changes because of it?
- What can go wrong in production?
- What metric proves it is working?
- What should be delegated to engineering depth?

## Shared Case Standard

Use a consistent example where useful:

GTM / Sales Agent:
An Agent helps sales or GTM teams research target accounts, find key people, identify buying signals, generate evidence-backed outreach reasons, and support follow-up workflows.

The example should help the reader connect LLM, RAG, tool calling, workflow, memory, eval, safety, cost, and productization into one coherent interview story.

## Review Rubric

Each review thread should score the document from 1 to 5 on:

1. Coverage: Does it cover the key concepts broadly enough?
2. PM relevance: Does it connect technology to product decisions?
3. Technical correctness: Is it accurate and current?
4. Interview usefulness: Can the reader answer interview questions after reading?
5. Practical examples: Does it include useful GTM / Sales / Marketing Agent examples?
6. Structure and readability: Is it easy to study and review?
7. Source quality: Are references reliable and relevant?

Passing threshold:
- Overall score must be at least 4 out of 5.
- No individual category should be below 3.
- Any factual error, missing references, or missing interview section must be flagged for revision.

## Review Output Format

Each review thread should produce:

1. Overall verdict: Pass / Needs Revision
2. Score table
3. Top issues ranked by severity
4. Missing topics
5. Suggested edits
6. Whether the document reaches the 80% interview-ready standard

