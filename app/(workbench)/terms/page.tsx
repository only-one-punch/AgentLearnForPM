import { TermBrowser } from "../../../components/search/term-browser";
import { getTerms } from "../../../components/ui/workbench-data";

export default function TermsPage() {
  return <TermBrowser terms={getTerms()} />;
}
