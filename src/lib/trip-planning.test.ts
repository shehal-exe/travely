import { describe, expect, it } from "vitest";
import { daysInTrip, defaultPacking, haversineKm, planSchema, suggestStopOrder, type TripStop } from "./trip-planning";

const stop = (id: string, name: string, latitude: number, longitude: number): TripStop => ({
  id, name, latitude, longitude, slug: null, region: null, day: 1, note: "", budget: null,
});

const validPlan = {
  title: "A journey across India", start_date: "2026-11-01", end_date: "2026-11-05",
  budget_total: 30000, notes: "", stops: [] as TripStop[], packing: [],
  expenses: { transport: 10000, stay: 8000, food: 5000, activities: 2000 },
};

describe("trip planning", () => {
  it("accepts a valid trip and rejects a stop beyond its dates", () => {
    expect(planSchema.safeParse(validPlan).success).toBe(true);
    const invalid = { ...validPlan, stops: [stop("70ee6eec-c10c-4e58-bc7c-44393e057113", "Agra", 27.1767, 78.0081)] };
    invalid.stops[0].day = 6;
    expect(planSchema.safeParse(invalid).success).toBe(false);
  });

  it("limits trip length and counts days inclusively", () => {
    expect(daysInTrip("2026-11-01", "2026-11-05")).toBe(5);
    expect(planSchema.safeParse({ ...validPlan, end_date: "2027-02-01" }).success).toBe(false);
  });

  it("measures geographical distance and returns a shorter suggested order", () => {
    const places = [
      stop("a", "Delhi", 28.6139, 77.209),
      stop("b", "Jaipur", 26.9124, 75.7873),
      stop("c", "Agra", 27.1767, 78.0081),
    ];
    expect(haversineKm(places[0], places[2])).toBeGreaterThan(150);
    const ordered = suggestStopOrder(places);
    const length = (items: TripStop[]) => items.slice(1).reduce((sum, item, index) => sum + (haversineKm(items[index], item) ?? 0), 0);
    expect(length(ordered)).toBeLessThanOrEqual(length(places));
  });

  it("suggests category-relevant packing without claiming a forecast", () => {
    const labels = defaultPacking(["Beaches"]).map((item) => item.label);
    expect(labels).toContain("Sun protection and swimwear");
    expect(labels).not.toContain("Warm layers and walking shoes");
  });
});
