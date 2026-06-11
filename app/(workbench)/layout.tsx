import type { ReactNode } from "react";
import { WorkbenchShell } from "../../components/layout/workbench-shell";

export default function WorkbenchLayout({ children }: { children: ReactNode }) {
  return <WorkbenchShell>{children}</WorkbenchShell>;
}
