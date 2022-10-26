import { getContentPaths } from "@/utils/content/content-helpers";
import ContentMeta from "@/components/content-pages/content-meta";
import useTranslation from "next-translate/useTranslation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";

const BlogIndex = ({ articles }) => {
  const { t } = useTranslation("content");
  return (
    <div className="max-w-prose mx-auto mt-8">
      <ContentMeta
        title={t("blog")}
        description={t("blogDescription")}
        socialDescription={t("blogDescription")}
      />
      <div className="grid gap-y-12">
        {articles.map((article) => (
          <article key={article.fullPath} className="prose">
            {!!article.meta?.category && (
              <span className="text-primary font-bold text-sm">
                {article.meta.category}
              </span>
            )}
            <Link
              key={article.fullPath}
              href={article.fullPath}
              passHref
              className="no-underline"
            >
              <h1>{article.title}</h1>
            </Link>
            <MDXRemote {...article.content} />
          </article>
        ))}
      </div>
    </div>
  );
};

export default BlogIndex;

export async function getStaticProps({ params, locale, ...rest }) {
  const content = await getContentPaths(locale, "blog");
  const articles = [];
  for (const article of content) {
    articles.push({
      ...article,
      content: await serialize(article.content),
    });
  }
  return {
    props: {
      articles: articles.reverse(),
    },
  };
}
