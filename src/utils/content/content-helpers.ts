import matter from "gray-matter";
import { join } from "path";
import { readdirSync, readFileSync } from "fs";
import { slugToTitle } from "@/utils/content/slug-to-title";
import { compareAsc, isBefore } from "date-fns";

type ContentTypes = "docs" | "blog";

/**
 * Next requires a json-serializable object to be returned from getStaticProps
 * So we have to cleanup the metadata that gets returned a bit
 * @param filePath
 */
function loadFileWithMeta(filePath: string) {
  const file = readFileSync(filePath, "utf8");
  const { data: meta, content } = matter(file);
  return { meta: JSON.parse(JSON.stringify(meta)), content };
}

/**
 * We want to load files from the content directory for production, or from the test directory for tests
 * We do this so that after the project template is copied somewhere else things don't start failing
 * once people add their own docs/blogs
 */
const basePath =
  process.env.NODE_ENV === "test" ? "__tests__/content" : "content";

type ContentPathsObject = {
  slug: string;
  fullPath: string;
  title: string;
  content: string;
  meta: {
    [key: string]: any;
  };
};

type ContentPathsResponse = Array<ContentPathsObject>;

/**
 * Generates a list of content paths for a given content type and locale
 * @param locale
 * @param contentType
 */
export async function getContentPaths(
  locale: string,
  contentType: ContentTypes
): Promise<ContentPathsResponse> {
  const files = readdirSync(join(process.cwd(), basePath, contentType, locale));
  return (
    files
      .map((filePath) => {
        // clean up markdown extension and replace index files with a non-index slug
        const slug = filePath.replace(/\.md$/, "").replace(/\/?index$/, "");
        const { meta, content } = loadFileWithMeta(
          join(process.cwd(), basePath, contentType, locale, filePath)
        );

        return {
          slug,
          fullPath: join("/", contentType, slug),
          meta,
          title: meta?.title || slugToTitle(slug),
          content,
        };
      })
      // remove unpublished files
      .filter(
        (file) =>
          file.meta?.published &&
          isBefore(new Date(file.meta.published), new Date())
      )
      // sort by publish date
      .sort((fileA, fileB) => {
        return compareAsc(
          new Date(fileA.meta.published),
          new Date(fileB.meta.published)
        );
      })
  );
}

type GetContentBySlugResponse = {
  slug: string;
  title: string;
  meta: {
    [key: string]: any;
  };
  content: string;
};

/**
 * Gets the full content object for a given content type, locale and slug
 * @param slug
 * @param locale
 * @param contentType
 */
export async function getContentBySlug(
  slug: string,
  { locale, contentType }: { locale: string; contentType: ContentTypes }
): Promise<GetContentBySlugResponse> {
  /**
   * We've probably been given a url slug, but it could be a file path
   * so we normalize it here.
   */
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(
    process.cwd(),
    basePath,
    contentType,
    locale,
    `${realSlug}.md`
  );
  const { meta, content } = loadFileWithMeta(fullPath);

  return {
    slug,
    meta,
    content,
    title: meta?.title || slugToTitle(slug),
  };
}

export type GetDocsNavigationResponse = {
  rootPaths: Array<ContentPathsObject>;
  categories: {
    [key: string]: Array<ContentPathsObject>;
  };
};

/**
 * Returns a navigation object to be used when rendering the docs navigation.
 * This one does not apply to blogs
 * @param locale
 */
export async function getDocsNavigation(
  locale: string
): Promise<GetDocsNavigationResponse> {
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

  return navigation;
}
