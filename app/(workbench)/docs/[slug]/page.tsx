import { BlogArticle } from "../../../../components/blog/blog-article";
import { getBlogArticle, getBlogDocuments } from "../../../../components/blog/blog-data";

export function generateStaticParams() {
  return getBlogDocuments().map((document) => ({ slug: document.slug }));
}

export default async function DocumentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getBlogArticle(slug);

  return <BlogArticle article={article} />;
}
