# Review: 04. Tool Calling 工具调用

## Overall Verdict: Pass

该文档达到「强技术型 Agent 产品经理读完后达到 80% 面试可用理解」标准。它不仅解释了 tool calling 的基本机制，还覆盖了 PM 必须能讲清楚的产品边界：工具选择、schema 设计、权限、审批、失败恢复、trace、eval、GTM Agent 场景和面试表达。

整体判断：可以作为面试准备材料使用。若要进一步增强，应补充平台差异、真实工具调用报文、MCP 安全边界和生产 rollout 细节，但这些属于提升项，不影响通过。

## Score Table

| Dimension | Score | Rationale |
| --- | ---: | --- |
| Coverage | 4.5 / 5 | 覆盖 tool schema、tool call loop、tool choice、权限、HITL、失败模式、eval、trace、MCP、安全、GTM 案例，范围完整。缺少少量 provider-specific 差异和 rollout/checklist。 |
| PM relevance | 5 / 5 | 强烈连接产品决策：自动执行 vs 人工确认、工具粒度、动态加载、风险分层、用户可见日志、业务指标。非常符合 Agent PM 读者。 |
| Technical correctness | 4 / 5 | 主体准确：模型生成结构化调用，应用层执行、校验和审计；schema 是契约；工具结果需回传模型。少数地方略概括，如 `tool_choice` 取值、服务端工具/客户端工具边界、不同厂商 tool result 格式差异。 |
| Interview usefulness | 4.5 / 5 | 高频 Q&A、30 秒和 2 分钟回答、加分句都很实用。若增加 1-2 个“追问场景”的回答会更强。 |
| Practical examples | 4.5 / 5 | GTM / Sales Agent 例子完整，覆盖读工具、写工具、审批、查重和最终输出。可再增加一个具体 tool call JSON 与 tool result JSON。 |
| Structure and readability | 4.5 / 5 | 结构清楚，和质量标准要求高度一致。内容较长但可学习；可通过表格化 checklist 和小结减少复习成本。 |
| Source quality | 4 / 5 | 引用了 OpenAI、Anthropic、LangChain/LangGraph、MCP、OWASP 等可靠来源。建议补充访问日期或区分“官方协议/框架文档”和“工程博客”。 |

## Top Issues Ranked By Severity

1. Medium: Provider-specific behavior is under-specified.
   文档把 `tool_choice`、`tool_call_id`、`tool_result`、并行调用、strict schema 等概念讲成通用抽象，这适合 PM 入门，但面试中可能被追问 OpenAI、Anthropic、LangChain/LangGraph、MCP 的差异。建议补一小节说明：不同平台名称和字段不完全一致，PM 应掌握抽象契约，不应死背某个 SDK。

2. Medium: Security section is good but MCP-specific risk could be sharper.
   已提到 prompt injection、tool poisoning、allowlist、最小权限，但 MCP/Connector 场景还可以补充 tool description poisoning、rug-pull/change-after-approval、excessive tool scopes、cross-tool privilege escalation、connector supply-chain trust 这些更贴近 2026 Agent 安全讨论的风险。

3. Medium: Practical JSON examples stop at tool schema,缺少完整 execution trace 示例。
   对面试和 PM-Engineering 沟通来说，最好展示一次完整闭环：用户输入 -> model emits tool call -> app validates -> tool result -> model final answer。现在文档讲得很清楚，但如果加入一个短 JSON trace，读者会更容易回答“具体系统里怎么传递”的追问。

4. Low: Metrics section lacks acceptance thresholds and MVP gating examples.
   指标很全，但 PM 还需要知道上线前怎么定门槛。例如 tool selection accuracy >= X%、unauthorized call block rate = 100%、approval trigger recall 接近 100%、duplicate action rate 低于某阈值等。即使不写具体数字，也应说明按风险级别设 gate。

5. Low: Structure is complete but slightly long for复习。
   896 行内容信息密度高，适合学习，但面试复习时可能不够快。建议增加一张“PM decision checklist”或“面试前 5 分钟速记表”。

## Missing Topics

- OpenAI / Anthropic / LangGraph / MCP 在 tool calling 抽象上的字段和执行责任差异。
- 完整 tool call + tool result + final answer 的最小 trace 示例。
- MCP connector 供应链、安全授权和 tool discovery 风险的更细说明。
- Tool versioning / schema migration：工具 schema 改动后如何保持 eval、trace replay 和旧任务兼容。
- Rollout strategy：先 shadow mode / draft mode / limited workspace，再逐步扩大自动执行范围。
- Concrete MVP readiness gates：哪些指标达标后才允许从建议模式进入执行模式。
- Tool result trust boundary：外部工具返回内容应作为 untrusted data，哪些字段可进入模型上下文，哪些只能用于 UI 或审计。

## Suggested Edits

- Add a short subsection: “Provider differences a PM should know.”
  Include examples such as OpenAI tool calls, Anthropic `tool_use` / `tool_result`, LangGraph ToolNode, MCP tools/connectors. Emphasize that the product contract is stable even if SDK fields differ.

- Add one concise end-to-end JSON example.
  Use the GTM Agent case: `crm_search_account` tool call, successful tool result, then `crm_create_lead_draft` requiring approval. Keep it short and annotated for PM comprehension.

- Strengthen MCP security section.
  Add tool description poisoning, excessive scope, connector trust, tool rug-pull, and cross-tool data exfiltration examples.

- Add a “launch checklist” for Agent PMs.
  Example items: tools categorized by risk, approval required for high-risk writes, trace enabled, logs redacted, eval set built, duplicate write prevention, idempotency keys, rollback path, user-visible action history.

- Add readiness gate examples.
  For example: do not enable auto-write until duplicate action rate and unauthorized call attempts are acceptably low; approval trigger must have very high recall for high-risk actions; destructive actions remain disabled by default.

- Improve reference hygiene.
  Add retrieval date or note “official docs, accessed 2026-06” for fast-changing vendor docs. Consider adding OWASP Top 10 for LLM Applications / Agentic Applications if used for broader agent security framing, not only OWASP MCP Top 10.

## 80% Interview-Ready Judgment

Yes. The document reaches approximately 80-85% interview-ready understanding for a strong technical Agent PM.

After reading it, a PM should be able to:

- Explain why tool calling turns an LLM into an action-capable Agent.
- Describe the model/application/tool-result loop accurately.
- Distinguish schema, tool call, tool result, tool choice, structured output, and orchestration.
- Discuss product tradeoffs around tool granularity, dynamic loading, cost, latency, approval, and risk.
- Define production failure modes and mitigation strategies.
- Propose evaluation metrics for tool selection, argument correctness, approval behavior, trace quality, and business completion.
- Tell a coherent GTM / Sales Agent story in interviews.

The main remaining gap is not conceptual coverage but precision under deeper technical follow-up. Adding provider differences, concrete trace examples, and stricter MCP/security launch gates would make it more defensible in senior PM interviews.

## Required Revision Checklist

No mandatory revision required for passing.

Recommended before final publication:

- Add provider-difference subsection.
- Add one full tool call lifecycle JSON example.
- Expand MCP/connector security risks.
- Add launch readiness checklist.
- Add MVP/eval threshold examples.
