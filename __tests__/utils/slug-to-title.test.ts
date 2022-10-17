import { slugToTitle } from "@/utils/content/slug-to-title";

describe("Slug to title", () => {
  test("Should know how to convert a slug into a title", () => {
    expect(slugToTitle("hello-world")).toEqual("Hello World");
    expect(slugToTitle("hello-world_2")).toEqual("Hello World 2");
    expect(slugToTitle("hello-world-again-again")).toEqual(
      "Hello World Again Again"
    );
  });

  test("Should know how to handle empty slugs", () => {
    expect(slugToTitle("")).toEqual("");
  });
});
