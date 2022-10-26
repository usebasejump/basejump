import {
  getContentBySlug,
  getContentPaths,
} from "@/utils/content/content-helpers";
import { MDXRemote } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import ContentMeta from "@/components/content-pages/content-meta";

const BlogShow = ({ content, title, meta }) => {
  const { t } = useTranslation("content");
  return (
    <div className="prose mx-auto">
      <ContentMeta
        title={title}
        description={meta?.description}
        socialDescription={meta?.socialDescription}
        socialImage={`/api/og?title=${title}`}
      />
      <div className="breadcrumbs text-sm mb-4">
        <ul className="m-0 p-0">
          <li className="p-0">
            <Link href="/" passHref>
              {t("home")}
            </Link>
          </li>
          <li>
            <Link href="/blog" passHref>
              {t("blog")}
            </Link>
          </li>
          <li>{title}</li>
        </ul>
      </div>
      {!!meta?.category && (
        <span className="text-primary font-bold text-sm">{meta.category}</span>
      )}
      <h1 className="mt-0 pt-0">{title}</h1>
      <MDXRemote {...content} />
    </div>
  );
};

export default BlogShow;

export async function getStaticProps({ params, locale, ...rest }) {
  const blog = await getContentBySlug(params.slug?.[0], {
    locale,
    contentType: "blog",
  });

  const content = await serialize(blog.content);
  return {
    props: {
      ...blog,
      content,
    },
  };
}

export async function getStaticPaths({ locales }) {
  const paths = [];
  for (const locale of locales) {
    const filePaths = await getContentPaths(locale, "blog");
    filePaths.forEach((filePath) => {
      paths.push({
        params: {
          slug: [filePath.slug],
        },
        locale,
      });
    });
  }

  return {
    paths,
    fallback: false,
  };
}
