import { describe, expect, it } from "vitest";
import { commentSchema, socialIdSchema } from "./social";

describe("social input validation", () => {
  it("accepts a traveller UUID", () => expect(socialIdSchema.safeParse("70be6dac-b93b-44c0-9ae7-52696b1dc9b0").success).toBe(true));
  it("rejects demo and malformed IDs", () => {
    expect(socialIdSchema.safeParse("demo-ananya").success).toBe(false);
    expect(socialIdSchema.safeParse("/profile/other").success).toBe(false);
  });
  it("trims a real comment", () => expect(commentSchema.parse("  Beautiful journey!  ")).toBe("Beautiful journey!"));
  it("rejects blank and overly long comments", () => {
    expect(commentSchema.safeParse("  ").success).toBe(false);
    expect(commentSchema.safeParse("a".repeat(1001)).success).toBe(false);
  });
});
