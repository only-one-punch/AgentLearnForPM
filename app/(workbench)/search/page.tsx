import { SearchWorkbench } from "../../../components/search/search-workbench";

export default function SearchPage({ searchParams }: { searchParams?: { q?: string } }) {
  return <SearchWorkbench initialQuery={searchParams?.q ?? ""} />;
}
