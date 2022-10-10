import { getContentBySlug, getContentPaths } from "@/utils/content/load-paths";
import { MDXRemote } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import DocsSidebar from "@/components/docs/docs-sidebar";

const DocsShow = ({ navigation, content, title, meta }) => {
  return (
    <div className="flex gap-x-4 max-w-screen-lg mx-auto mt-8">
      <div className="flex-none w-72">
        <DocsSidebar navigation={navigation} />
      </div>
      <div className="md:w-3/4">
        <div className="prose mx-auto">
          {!!meta?.category && (
            <span className="text-accent font-bold text-sm">
              {meta.category}
            </span>
          )}
          <h1 className="mt-0 pt-0">{title}</h1>
          <MDXRemote {...content} />
        </div>
      </div>
    </div>
  );
};

export default DocsShow;

export async function getStaticProps({ params, locale, ...rest }) {
  const doc = await getContentBySlug(params.slug?.[0], {
    locale,
    contentType: "docs",
  });

  const navigation = {
    rootPaths: [],
    categories: {},
  };

  const filePaths = await getContentPaths(locale, "docs");
  filePaths.forEach((filePath) => {
    if (filePath.meta?.category) {
      navigation.categories[filePath.meta.category] ||= [];
      navigation.categories[filePath.meta.category].push(filePath);
    } else {
      navigation.rootPaths.push(filePath);
    }
  });

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
