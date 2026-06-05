# Review: 06 - Memory 记忆系统

## Overall verdict: Pass

这份文档达到「强技术型 Agent 产品经理读完后达到 80% 面试可用理解」标准。它没有把 memory 写成数据库或向量检索教程，而是围绕 Agent 产品里的长期协作、个性化、任务延续、权限、隐私、删除、评估和 GTM/Sales 场景建立了清晰框架。

主要优点是：短期记忆、长期记忆、任务状态、CRM/system of record、RAG、上下文窗口之间的边界讲得清楚；写入、检索、注入、更新/遗忘的闭环完整；风险意识强，覆盖错误记忆、过期记忆、跨租户泄漏、memory poisoning、删除语义；面试问答和 GTM Agent 案例可直接复用。主要不足是：生产级 memory schema、冲突解决、生命周期治理、团队/组织级共享记忆、合规删除的操作边界还可以更具体；source freshness 整体可靠，但应补访问日期和版本说明。

## Score table

| Dimension | Score | Rationale |
|---|---:|---|
| Coverage | 4.5 | 覆盖 memory 基本概念、类型、写入/检索/遗忘闭环、与 RAG/CRM/workflow/context 的区别、失败模式、指标、案例和面试表达。缺少更系统的 schema、冲突解决、多用户共享记忆和 lifecycle policy 展开。 |
| PM relevance | 5 | 持续把技术点连接到产品价值、用户体验、信任、合规、MVP 边界、系统分工和 GTM Agent 决策，非常符合 Agent PM 读者。 |
| Technical correctness | 4.5 | 核心表述准确。OpenAI Agents SDK sessions、LangGraph/LangChain memory、LlamaIndex memory、OWASP 风险框架的引用方向与当前官方资料基本一致。部分 ChatGPT Memory 产品能力、OpenAI SDK 能力和监管来源需要加访问日期/版本以避免后续漂移。 |
| Interview usefulness | 5 | 有 12 个高频问答、30 秒/2 分钟话术、设计题答题框架和一句话表达，读者可形成稳定面试回答。 |
| Practical examples | 5 | GTM / Sales / Marketing Agent 示例具体到记忆类型、scope、来源、写入策略、工作流、UI、MVP 边界和指标，实用性强。 |
| Structure and readability | 4.5 | 结构完整，表格、mermaid 和分层标题便于复习。篇幅较长但可扫描；可增加一张「Memory MVP checklist」或「Schema cheat sheet」提高复习效率。 |
| Source quality | 4 | 来源质量高，包含 OpenAI、LangGraph/LangChain、LangMem、LlamaIndex、OWASP、AWS、NIST、FTC、GDPR。问题是缺少统一访问日期/版本，且部分监管/产品来源需要说明只是用于治理背景，不等同于实现规范。 |

Overall score: 4.6 / 5

## Top issues ranked by severity

1. **[Medium] 缺少一张生产级 memory record schema / contract**
   - 文档多次正确提到 source、timestamp、confidence、TTL、permission scope，但没有集中成一张 PM 可拿去和工程对齐的数据契约。
   - 建议补一张表：`memory_id`、`type`、`scope`、`owner_id`、`subject/object`、`content`、`source`、`source_uri`、`created_at`、`updated_at`、`expires_at/TTL`、`confidence`、`sensitivity`、`permissions`、`write_policy`、`last_used_at`、`status`、`audit_id`。
   - 面试价值：能从概念解释升级到“我知道上线时要定义哪些字段和治理边界”。

2. **[Medium] 冲突解决和 memory consolidation 讲得不够系统**
   - 文档提到纠错、更新、降权和权威系统优先，但没有展开多条记忆互相冲突时的策略。
   - 典型问题：用户偏好从“短邮件”变成“详细邮件”；CRM 与聊天记忆冲突；两个销售对同一 account 有不同观察；旧 objection 与新 call note 不一致。
   - 建议补充 resolution order：用户最新确认 > system of record > admin/team policy > recent trusted tool result > older inferred memory；并说明合并、取代、保留历史、标记 conflict 的产品策略。

3. **[Medium] 组织级 / 团队级 / 多 Agent 共享记忆的治理可以更强**
   - 文档有 user/org/object scope，但 GTM 场景里团队 SOP、account memory、multi-agent handoff 会涉及共享记忆。
   - 缺少的问题包括：谁能创建团队级记忆、是否需要管理员批准、如何避免个人偏好污染团队 SOP、不同 agent 是否共享同一 memory store、共享记忆是否有 owner 和 review cadence。
   - 这不是基础理解的阻塞项，但 senior Agent PM 面试可能会追问。

4. **[Low-Medium] 删除、保留、审计和训练使用边界还可更可执行**
   - 文档已经正确强调“忘记”可能不等于删除所有副本，也提到 saved memories、聊天、文件库、连接应用等边界。
   - 还可以增加 PM launch checklist：删除 SLA、缓存/索引失效、备份保留、审计日志保留、企业数据不用于训练的承诺位置、管理员导出/删除流程。
   - 风险：用户在高合规场景里会把“忘记”理解为法律意义上的删除，产品文案和实现边界必须一致。

5. **[Low] Source freshness 和引用精度需要统一处理**
   - 文档引用质量不错，但没有统一标注 accessed date。OpenAI Help/SDK、LangGraph/LangMem/LlamaIndex 文档变化较快。
   - 建议给快速变化来源加 `accessed on 2026-06-04`，并把 ChatGPT Memory FAQ 与 OpenAI Agents SDK session memory 区分为“产品级记忆体验”和“开发框架会话历史能力”。

## Missing topics

- Production memory schema / memory contract：字段、状态、权限、敏感度、审计、过期、来源和 owner。
- Memory lifecycle policy：candidate、confirmed、active、stale、archived、deleted、blocked 的状态流转。
- Conflict resolution：新旧记忆冲突、不同来源冲突、个人记忆与团队记忆冲突、CRM 与 memory 冲突。
- Memory consolidation / compaction：什么时候合并、摘要、去重、替换，如何防止摘要错误持续污染。
- Shared/team memory governance：团队 SOP、account-level shared memory、管理员审批、review cadence。
- Multi-agent memory boundaries：多个 agent 是否共享记忆、handoff 时传递哪些状态、如何避免跨 agent 污染。
- Data retention and deletion operations：删除 SLA、索引/缓存/备份处理、审计日志保留、企业管理员策略。
- Launch readiness thresholds：错误记忆率、删除生效率、跨租户隔离测试、memory poisoning 测试的上线门槛。

## Suggested edits

1. 在第 4 节 `How it works` 后增加 `4.x Memory record schema：PM 要求工程明确的字段`
   - 用一张表列出最小字段：type、scope、owner、source、timestamp、confidence、TTL、sensitivity、permission、status、audit。
   - 加一句：没有这些字段，memory 很难做到可解释、可删除、可评估。

2. 在第 4.6 `遗忘` 后增加 `冲突与合并`
   - 覆盖同一偏好的新旧版本、CRM 与聊天冲突、团队 SOP 与个人偏好冲突。
   - 给出优先级规则：权威系统和用户最新确认优先；低置信度自动记忆不能覆盖高置信度确认记忆。

3. 在第 7 节 tradeoffs 增加 `个人记忆 vs 团队记忆`
   - 说明哪些适合 user scope，哪些适合 team/workspace scope，哪些必须留在 CRM/workflow。
   - 补充管理员审批、可见性、审计和 review cadence。

4. 在第 9 节指标中补充 launch gates
   - Cross-tenant memory retrieval 必须为 0。
   - Secret/token write 必须为 0。
   - 删除生效后引用率必须为 0。
   - 高风险 business memory 使用前刷新 system of record 的覆盖率。
   - Memory write precision / memory conflict resolution accuracy 的人工抽检门槛。

5. 在第 11 节新增 2 个面试问答
   - `Q13: 如果两条 memory 冲突，Agent 应该相信哪一条？`
   - `Q14: 团队级 memory 和个人级 memory 应该如何设计权限？`

6. 更新 references
   - 为 OpenAI、LangGraph/LangChain、LangMem、LlamaIndex、OWASP 等快速变化来源增加访问日期。
   - 对 FTC、GDPR、NIST 来源注明其用途是治理原则和监管背景，而不是 memory 系统的具体工程规范。

## 是否达到 80% 面试可用理解

Yes.

读者读完后应能达到 80% 面试可用理解：可以解释 Agent memory 是什么、为什么长上下文不能替代 memory、短期/长期/任务/CRM/RAG 的边界，能设计 GTM/Sales Agent 的 memory MVP，能回答写入策略、检索策略、删除、隐私、安全、评估、失败模式等常见问题。

这份文档已经可以用于面试准备和产品讨论。它离更强的 senior-level 材料主要差在生产治理细节：memory schema、冲突合并、共享记忆治理、生命周期状态机、删除 SLA 和上线门槛。如果补上这些，文档会更适合回答深入追问。

## Must-change checklist

Because verdict is **Pass**, there are no blocking must-change items.

Recommended before publishing:

- [ ] Add a production memory record schema / PM-engineering contract table.
- [ ] Add conflict resolution and memory consolidation guidance.
- [ ] Add personal vs team/shared memory governance.
- [ ] Add deletion/data retention operational checklist.
- [ ] Add launch gates for cross-tenant leakage, secret writes, deletion effectiveness and memory poisoning.
- [ ] Add access dates or version notes to fast-changing references.
