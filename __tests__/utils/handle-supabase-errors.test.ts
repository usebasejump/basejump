import handleSupabaseErrors from "@/utils/handle-supabase-errors";

describe("Handle supabase responses", () => {
  test("Should know how to throw an error if an error exists", () => {
    expect(() => handleSupabaseErrors(null, { message: "error" })).toThrow(
      "error"
    );
  });

  test("Should know how to not throw an error if no error exists", () => {
    expect(() => handleSupabaseErrors({}, null)).not.toThrow();
  });
});
