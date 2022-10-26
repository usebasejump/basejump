import {
  getContentBySlug,
  getContentPaths,
  getDocsNavigation,
} from "@/utils/content/content-helpers";
import { MDXRemote } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import DocsLayout from "@/components/docs/docs-layout";
import ContentMeta from "@/components/content-pages/content-meta";

const DocsShow = ({ navigation, content, title, meta }) => {
  return (
    <DocsLayout navigation={navigation}>
      <ContentMeta
        title={title}
        description={meta.description}
        socialDescription={meta.socialDescription}
        socialImage={`/api/og?title=${title}`}
      />
      <div className="prose mx-auto">
        {!!meta?.category && (
          <span className="text-primary font-bold text-sm">
            {meta.category}
          </span>
        )}
        <h1 className="mt-0 pt-0">{title}</h1>
        <MDXRemote {...content} />
      </div>
    </DocsLayout>
  );
};

export default DocsShow;

export async function getStaticProps({ params, locale, ...rest }) {
  const doc = await getContentBySlug(params.slug?.[0], {
    locale,
    contentType: "docs",
  });

  const navigation = await getDocsNavigation(locale);

  const content = await serialize(doc.content);
  return {
    props: {
      ...doc,
      navigation,
      content,
    },
  };
}

export async function getStaticPaths({ locales }) {
  const paths = [];
  for (const locale of locales) {
    const filePaths = await getContentPaths(locale, "docs");
    filePaths
      .filter(
        // Resolves an issue where returning empty paths collides with the index page
        // known issue: https://github.com/vercel/next.js/issues/12717
        (filePath) => !filePath.slug.includes("index") && filePath.slug !== ""
      )
      .forEach((filePath) => {
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
