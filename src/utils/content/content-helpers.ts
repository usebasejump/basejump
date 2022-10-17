import matter from "gray-matter";
import { join } from "path";
import { readdirSync, readFileSync } from "fs";
import { slugToTitle } from "@/utils/content/slug-to-title";
import { compareAsc, isBefore } from "date-fns";

type ContentTypes = "docs" | "blog";

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
  const files = readdirSync(
    join(process.cwd(), "content", contentType, locale)
  );
  return (
    files
      .map((filePath) => {
        // clean up markdown extension and replace index files with a non-index slug
        const slug = filePath.replace(/\.md$/, "").replace(/\/?index$/, "");
        const source = readFileSync(
          join(process.cwd(), "content", contentType, locale, filePath),
          "utf8"
        );
        const { data: meta, content } = matter(source);
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
          file.meta?.published && isBefore(file.meta.published, new Date())
      )
      // sort by publish date
      .sort((fileA, fileB) => {
        return compareAsc(fileA.meta.published, fileB.meta.published);
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
    "content",
    contentType,
    locale,
    `${realSlug}.md`
  );
  const fileContents = readFileSync(fullPath, "utf8");
  const { data: meta, content } = matter(fileContents);

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
