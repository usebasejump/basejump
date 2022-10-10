import matter from "gray-matter";
import { join } from "path";
import { readdirSync, readFileSync } from "fs";
import { slugToTitle } from "@/utils/content/slug-to-title";

type ContentTypes = "docs" | "blog";

type ContentPathsResponse = Array<{
  slug: string;
  title: string;
  meta: {
    [key: string]: any;
  };
}>;

export async function getContentPaths(
  locale: string,
  contentType: ContentTypes
): Promise<ContentPathsResponse> {
  const files = readdirSync(
    join(process.cwd(), "content", contentType, locale)
  );
  return files.map((filePath) => {
    const slug = filePath.replace(/\.md$/, "");
    const source = readFileSync(
      join(process.cwd(), "content", contentType, locale, filePath),
      "utf8"
    );
    const { data: meta } = matter(source);
    return {
      slug,
      meta,
      title: meta?.title || slugToTitle(slug),
    };
  });
}

type GetContentBySlugResponse = {
  slug: string;
  title: string;
  meta: {
    [key: string]: any;
  };
  content: string;
};

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
