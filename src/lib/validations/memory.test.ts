import { describe, expect, it } from "vitest";
import { memorySchema } from "./memory";

const valid = {
  title: "A quiet morning in Munnar",
  destinationName: "Munnar",
  locationVisited: "Tea Museum Road",
  country: "India",
  travelDate: "2026-06-11",
  description: "A peaceful morning among tea gardens, misty hills, and local cafés.",
  travelTips: "Arrive early and carry a light rain jacket.",
  rating: 5,
  category: "Hill Stations",
  visibility: "public" as const,
};

describe("memorySchema", () => {
  it("accepts a valid memory", () => expect(memorySchema.safeParse(valid).success).toBe(true));
  it("rejects ratings outside 1–5", () => expect(memorySchema.safeParse({ ...valid, rating: 9 }).success).toBe(false));
  it("rejects stories that are too short", () => expect(memorySchema.safeParse({ ...valid, description: "Nice" }).success).toBe(false));
  it("accepts optional trip details", () => expect(memorySchema.safeParse({
    ...valid, totalExpense: "18350.50", daysSpent: "3", tripStyle: "Solo · Budget", authorNote: "I explored the hills slowly.",
  }).success).toBe(true));
  it("rejects invalid budget and duration", () => {
    expect(memorySchema.safeParse({ ...valid, totalExpense: "-1" }).success).toBe(false);
    expect(memorySchema.safeParse({ ...valid, daysSpent: "366" }).success).toBe(false);
  });
  it("rejects a future travel date", () => expect(memorySchema.safeParse({ ...valid, travelDate: "2099-01-01" }).success).toBe(false));
});
