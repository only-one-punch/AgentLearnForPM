# Review: 08. Multi-Agent 多智能体

## Overall verdict: Pass

这份文档达到「强技术型 Agent 产品经理读完后达到 80% 面试可用理解」标准。它不是工程实现手册，但对 Agent PM 需要掌握的产品判断、架构模式、失败边界、评估指标、GTM 场景和面试表达覆盖充分，且整体立场成熟：多 Agent 是架构选择，不是默认炫技方案。

## Score table

| Dimension | Score (1-5) | Rationale |
| --- | ---: | --- |
| Coverage | 4 | 覆盖 supervisor、router、planner/executor/critic、handoff、parallel voting、context/state/trace、failure modes 和 metrics。缺少更系统的框架选型对比与生产运行约束。 |
| PM relevance | 5 | 持续连接 MVP 范围、UX、成本、权限、安全、评估、业务价值和组织协作，符合 Agent PM 读者定位。 |
| Technical correctness | 4 | 核心概念准确，workflow vs agent、handoff、supervisor、context management、least privilege 等判断可靠。少量表述可更精确，例如不同框架中 handoff/subagent/supervisor 的实现语义并不完全一致。 |
| Interview usefulness | 5 | 高频问答、30 秒/2 分钟表达、加分表达和 MVP 取舍回答都很面试友好。读者可直接形成可复述答案。 |
| Practical examples | 4 | GTM / Sales / Marketing Agent 示例具体，包含架构、MVP 演进、失败案例和改进方式。若补充一个 trace/评估样例表，会更接近实战。 |
| Structure and readability | 5 | 完整遵循质量标准要求的章节结构，层级清楚，表格和例子便于复习。 |
| Source quality | 4 | 引用了 LangChain/LangGraph、OpenAI Agents SDK、Anthropic、CrewAI、AutoGen、OWASP 等高质量来源。建议增加引用日期/版本说明，并把关键事实与引用更直接绑定。 |

## Top issues ranked by severity

1. **Framework selection is underdeveloped for PM decision-making.**  
   文档引用了 OpenAI Agents SDK、LangChain/LangGraph、CrewAI、AutoGen，但正文没有给出「PM 如何和工程一起选型」的比较维度，例如可观测性、state graph、handoff 原语、human-in-the-loop、部署复杂度、生态成熟度、企业权限/审计适配。面试中如果被问「为什么选 LangGraph 而不是 CrewAI / OpenAI Agents SDK？」读者还需要自己补一层答案。

2. **Production operation constraints are mentioned but not expanded enough.**  
   文档已经提到成本、延迟、trace、权限，但对长任务生产化里的取消、重试、幂等、并发、队列、rate limit、partial failure、checkpoint/resume、tool timeout、写操作回滚等内容较轻。PM 不需要实现这些，但应该知道它们会影响 MVP 范围、SLA 和用户体验。

3. **Evaluation section is strong but lacks decision thresholds.**  
   指标列表完整，但缺少「何时证明多 Agent 值得」的门槛示例，例如多 Agent 版本必须在 task success、accepted output、human edit distance 或 critic catch rate 上提升多少，才能抵消新增 latency/cost。加入一个 A/B decision gate 会提升产品决策可用性。

4. **Source use is reliable but not tightly connected to claims.**  
   References 很丰富，但正文没有 inline citation 或「来源对应观点」标记。对学习文档来说可接受；若作为高可信技术知识库，建议把关键判断和官方文档对应起来，尤其是 handoff、subagents、workflow/agent 区分、OWASP security risks。

5. **User-facing UX patterns can be more concrete.**  
   文档指出用户不关心有几个 Agent，也建议展示阶段进度，但还可以补充多 Agent 产品界面的具体状态：queued/running/waiting for approval/blocked/retrying/failed with recovery、可展开 trace、证据引用、人工确认点、用户纠偏入口。

## Missing topics

- Framework selection matrix: OpenAI Agents SDK vs LangGraph/LangChain vs CrewAI vs AutoGen, with PM-facing tradeoffs.
- Production orchestration concerns: cancellation, retry policy, idempotency, checkpoint/resume, rate limits, timeouts, queueing, partial failure, rollback for write tools.
- Multi-agent observability product spec: what trace fields are needed, what PM should see in analytics, how to debug failed handoff or critic loops.
- Decision thresholds for adopting multi-agent over single-agent workflow.
- More explicit security mapping to OWASP LLM risks: prompt injection through tool outputs, excessive agency, sensitive information disclosure, unbounded consumption.
- Concrete output contract examples, such as a handoff packet schema or Research Agent evidence table schema.
- User experience recovery patterns when supervisor routes incorrectly or an agent stalls.

## Suggested edits

- Add a short section after `6. Common product decisions and tradeoffs`: **Framework choice: what PM should ask engineering**. Include a small table comparing state graph control, native handoff, tracing, human approval, deployment complexity, and ecosystem maturity.
- Add one concrete `handoff_packet` or `agent_output` schema example:

```json
{
  "user_goal": "...",
  "known_facts": [],
  "constraints": [],
  "evidence_refs": [],
  "completed_steps": [],
  "open_questions": [],
  "risk_flags": []
}
```

- Add an A/B decision gate example: "ship multi-agent only if accepted output rate improves by X%, human edit distance drops by Y%, and added latency/cost stays under agreed thresholds."
- Expand production failure modes with cancellation, retries, idempotency, and write-action rollback.
- Add a user-facing progress/recovery example for the GTM Agent, showing how the product communicates research, scoring, QA failure, human approval, and CRM draft save.
- Add inline source notes or footnote-style citations for the most important framework claims.

## Does it reach the 80% interview-ready standard?

Yes. A strong technical Agent PM could read this document and answer most common interview questions about:

- What multi-agent means and what problems it solves.
- When to use multi-agent vs single Agent + workflow.
- How supervisor, router, planner/executor/critic, handoff, and voting differ.
- What risks multi-agent introduces.
- How to evaluate cost, latency, quality, handoff success, critic quality, and user adoption.
- How to explain a GTM / Sales Agent example with MVP evolution and human approval.

The remaining gaps are mainly about deeper production readiness and framework selection, not basic interview usability. Recommended action: keep the document, make targeted additions rather than rewrite.

## Must-change checklist

Not required for pass. If the team wants this document to move from "interview-ready" to "excellent practical field guide", prioritize:

- Add framework selection matrix.
- Add production orchestration checklist.
- Add schema examples for handoff/output contracts.
- Add explicit A/B thresholds for deciding whether multi-agent is worth the cost.
- Add inline citations for key framework and safety claims.
