import { getContentPaths } from "@/utils/content/content-helpers";

describe("Content Helpers", () => {
  it("Should know how to load and sort correct docs", async () => {
    const docs = await getContentPaths("en", "docs");
    // should not load unpublished docs
    expect(docs.length).toEqual(2);
    // should sort them by published date
    expect(docs[0].title).toEqual("Getting Started");
  });

  it("Should know how to load and sort correct blogs", async () => {
    const blogs = await getContentPaths("en", "blog");
    // should not load unpublished blogs
    expect(blogs.length).toEqual(2);
    // should sort them by published date
    expect(blogs[0].title).toEqual("Hello World");
  });
});
