import type { MasteryStatus } from "./workbench-data";

const labels: Record<MasteryStatus, string> = {
  mastered: "已掌握",
  uncertain: "不确定",
  not_yet: "未掌握",
};

export function StatusPill({ status }: { status: MasteryStatus }) {
  return <span className={`status-pill status-pill--${status}`}>{labels[status]}</span>;
}
