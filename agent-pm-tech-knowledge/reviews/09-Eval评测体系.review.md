# Review: 09. Eval 评测体系

## Overall verdict: Pass

这份文档达到「强技术型 Agent 产品经理读完后达到 80% 面试可用理解」标准。它对 Agent eval 的产品意义、离线/线上评测、golden dataset、LLM-as-judge、人工评审、trace grading、回归测试、A/B 测试、业务指标连接和 GTM / Sales Agent 示例覆盖充分，且持续把技术指标落回 PM 需要做的发布门槛、质量权衡、用户采纳和 ROI 证明。

主要不足不是主干缺失，而是几个能让文档更“生产级”和更经得起追问的补强点：引用当前性需要标注，尤其 OpenAI Graders 文档当前提示相关 eval/fine-tuning workflows 中的 graders 正在迁移/弃用；人工标注一致性、统计显著性、eval 数据治理、隐私与 holdout 防污染还可以更具体。

## Score table

| Dimension | Score (1-5) | Rationale |
| --- | ---: | --- |
| Coverage | 5 | 覆盖 Agent eval 的关键概念和闭环：technical/product/business 三层指标、offline/online eval、golden dataset、human review、LLM-as-judge、trace grading、regression、A/B、dashboard 和 ROI。 |
| PM relevance | 5 | 强烈连接到 PM 决策：定义“好”、MVP 发布门槛、风险分级、人审策略、成本/延迟/质量权衡、企业验收和 GTM 业务价值。 |
| Technical correctness | 4 | 核心判断准确，和当前 OpenAI/Anthropic/LangSmith/Ragas 等 eval 实践大体一致；需要补充 fast-moving 文档的访问日期/版本说明，并更新 OpenAI graders 相关表述，避免把正在迁移的 API/工作流说成稳定长期形态。 |
| Interview usefulness | 5 | 高频问答、30 秒/2 分钟表达和加分话术非常可复述，读者可回答大多数 Agent PM eval 面试题。 |
| Practical examples | 5 | GTM / Sales / Marketing Agent 示例完整，包含指标目标、golden dataset、离线 suite、线上 dashboard 和一次端到端迭代故事。 |
| Structure and readability | 5 | 完整遵循质量标准要求的章节结构，层级清楚，表格密度高但可扫描，适合作为复习材料。 |
| Source quality | 4 | 引用了 OpenAI、Anthropic、LangSmith、LlamaIndex、Ragas 和 RAGAS paper 等可靠来源；但缺少访问日期/版本标注，且关键事实没有 inline citation，对快速变化的 eval 产品能力需要更精确绑定来源。 |

Overall score: 4.7 / 5

## Top issues ranked by severity

1. **OpenAI Graders / eval tooling references need current-version qualification.**
   - Severity: Medium
   - 文档引用 OpenAI `Graders` 作为当前 grader 类型来源是有价值的，但截至 2026-06-04 官方 Graders 页面提示：OpenAI is deprecating graders as part of the evals and fine-tuning workflows they support，并指向 deprecations page。原文没有说明这一点。
   - Risk: 面试或客户沟通中如果把具体 API/产品面说得过于固定，容易被追问“这是平台长期方向还是当前迁移中的能力”。建议把这一类引用改成“当前官方文档中的 eval/trace/dataset/grader 能力示例，具体 API 以最新文档为准”。

2. **Human evaluation governance is mentioned but not operationalized enough.**
   - Severity: Medium
   - 文档提到 rubric、人工评审、inter-rater agreement，但缺少 PM 应该如何推动标注一致性的具体做法：双人标注比例、分歧仲裁、标注员校准、gold label 更新流程、judge-human agreement 阈值。
   - Risk: 读者能说“要人工校准”，但如果面试官追问“怎么知道人工标注本身可靠”，答案还需要补一层。

3. **Statistical validity and experiment design can be sharper.**
   - Severity: Medium
   - A/B 测试章节正确，但对样本量、置信区间、最小可检测效果、分层随机、seasonality、销售周期滞后、leading vs lagging indicator 的实验读取方式较轻。
   - Risk: 对 Agent PM 面试足够，但对更强的数据产品/增长产品追问还不够扎实。

4. **Eval dataset lifecycle should include leakage, holdout, and versioning.**
   - Severity: Low to Medium
   - 文档讲了 golden dataset 来源和回流，但没有明确 dev/test/holdout 分层、防止 prompt 针对测试集过拟合、dataset versioning、case ownership、过期样本清理、生产分布漂移后的重采样规则。
   - Risk: 团队可能把 eval suite 变成“被 prompt 记住的考试题”，导致离线分数虚高。

5. **Privacy, compliance, and observability retention deserve a dedicated note.**
   - Severity: Low to Medium
   - 线上 eval 依赖 production traces，但 GTM / Sales 场景会包含客户信息、联系人、邮件内容、CRM 字段和可能的 PII。文档目前没有单独说明 trace 采集的脱敏、权限、保留周期、客户数据隔离和审计要求。
   - Risk: 企业客户验收时会追问“你们如何评测但不滥用客户数据”。

## Missing topics

- OpenAI / platform eval tooling currentness: API migration, product naming, access date, version notes.
- Human annotation QA: inter-rater agreement 的目标、抽样复标、分歧仲裁、标注员 training set。
- Statistical experiment design: sample size, confidence interval, MDE, guardrail metrics, sequential testing risks, cohort/seasonality control.
- Dataset lifecycle: dev/test/holdout split, regression suite vs blind holdout, dataset versioning, case aging, leakage prevention.
- Eval data governance: trace redaction, PII handling, retention policy, customer opt-out, role-based access to eval logs.
- Evaluator drift: LLM judge 模型升级后分数不可比，judge prompt/rubric 也需要版本管理。
- Severity taxonomy: P0/P1/P2 failure definitions and how they map to launch block, canary, rollback, or post-launch monitoring.
- Negative eval / safety eval: prompt injection through retrieved content or tool output, unsafe automation, excessive agency, data exfiltration, brand/compliance violation.
- Cost of evaluation itself: LLM judge、人工评审、trace storage 和 CI eval 的成本预算。

## Suggested edits

1. Add a short source freshness note in `14. References`:
   - "Accessed on 2026-06-04. OpenAI eval/graders APIs and product surfaces change quickly; use latest official docs before implementation."
   - For OpenAI Graders specifically, note that the current docs mention deprecation/migration for graders in some eval/fine-tuning workflows.

2. Add a subsection after `4.4 选择评分方式`:
   - Title: `4.4.1 人工评审如何保证一致性`
   - Cover: rubric training, two-reviewer overlap, inter-rater agreement, adjudication, periodic calibration, judge-human agreement.

3. Expand `4.3 构建 golden dataset` with lifecycle rules:
   - Split examples into `development set`, `regression set`, and `blind holdout set`.
   - Version every case with owner, source, risk label, last reviewed date.
   - Prevent overfitting by keeping a holdout set that prompt writers cannot inspect case-by-case.

4. Add a small table under `8.5 A/B 测试`:
   - Columns: experiment concern, PM question, example answer.
   - Include sample size, MDE, guardrail metrics, cohort stratification, sales-cycle lag, and when to use leading indicators.

5. Add a privacy/governance note under `4.6 线上评测` or `11.5 线上 dashboard`:
   - Production traces should be redacted, permissioned, retained for a defined period, and separated by customer/account.
   - Human reviewers should see only the minimum required context.

6. Add a severity taxonomy example:
   - P0: unsafe external action, customer data leak, fabricated material fact sent externally.
   - P1: wrong CRM write, misleading evidence, high-value account failure.
   - P2: tone mismatch, minor formatting issue, slow response.
   - Map each severity to launch block / canary / monitor / backlog.

7. Add one interview Q&A:
   - Question: "如何避免 eval 被 prompt 过拟合?"
   - Answer: keep separate development/regression/holdout sets, rotate production samples, version datasets, avoid exposing blind labels, and validate online behavior after offline gains.

## Does it reach the 80% interview-ready standard?

Yes. A strong technical Agent PM reading this document should be able to:

- Explain why Agent eval is a product quality system, not just a backend test.
- Distinguish offline eval, online eval, regression test, trace grading and A/B test.
- Design a golden dataset and rubric for a GTM / Sales Agent.
- Explain LLM-as-judge vs human review tradeoffs.
- Define task success, hallucination, evidence accuracy, tool call success, adoption, edit rate, latency, cost and ROI metrics.
- Set release gates and explain how failures flow back into the dataset.
- Tell a coherent interview story connecting technical eval, user adoption and business outcome.

The remaining gaps are production maturity details, not blockers for the 80% interview-ready goal. Recommended action: keep the document, then do a targeted polish pass for source versioning, annotation QA, statistical validity, dataset lifecycle and trace data governance.

## Must-change checklist

Because verdict is **Pass**, there are no blocking must-change items.

Recommended before publishing:

- [ ] Add access dates/version notes to fast-changing official docs.
- [ ] Update or qualify the OpenAI Graders reference because the current page notes deprecation/migration for some graders workflows.
- [ ] Add human evaluation governance: inter-rater agreement, adjudication and calibration.
- [ ] Add dataset lifecycle guidance: dev/regression/holdout split, versioning and leakage prevention.
- [ ] Add A/B/statistical validity guidance: sample size, confidence, MDE, guardrails and cohort effects.
- [ ] Add production trace privacy/governance guidance for PII, retention and reviewer access.
- [ ] Add one interview Q&A on avoiding eval overfitting.
