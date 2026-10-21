import { z } from "zod";

export const stopSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().max(120).nullable(),
  name: z.string().trim().min(2).max(120),
  region: z.string().max(120).nullable(),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
  day: z.number().int().min(1).max(61),
  note: z.string().max(500),
  budget: z.number().int().min(0).max(10000000).nullable(),
});

export const packingItemSchema = z.object({
  id: z.string().uuid(),
  label: z.string().trim().min(2).max(100),
  done: z.boolean(),
});

export const expenseSchema = z.object({
  transport: z.number().int().min(0).max(100000000),
  stay: z.number().int().min(0).max(100000000),
  food: z.number().int().min(0).max(100000000),
  activities: z.number().int().min(0).max(100000000),
});

export const planSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(3).max(120),
  start_date: z.iso.date(),
  end_date: z.iso.date(),
  budget_total: z.number().int().min(0).max(100000000).nullable(),
  notes: z.string().max(3000),
  stops: z.array(stopSchema).max(40),
  packing: z.array(packingItemSchema).max(100),
  expenses: expenseSchema,
}).superRefine((plan, context) => {
  const days = Math.round((Date.parse(`${plan.end_date}T00:00:00Z`) - Date.parse(`${plan.start_date}T00:00:00Z`)) / 86400000) + 1;
  if (days < 1 || days > 61) context.addIssue({ code: "custom", message: "Choose a trip lasting 1–61 days.", path: ["end_date"] });
  if (plan.stops.some((stop) => stop.day > days)) context.addIssue({ code: "custom", message: "A stop is scheduled beyond the trip dates.", path: ["stops"] });
});

export type TripStop = z.infer<typeof stopSchema>;
export type PackingItem = z.infer<typeof packingItemSchema>;
export type ExpenseBreakdown = z.infer<typeof expenseSchema>;
export type PlanInput = z.infer<typeof planSchema>;
export type TripPlan = PlanInput & { id: string; user_id: string; created_at: string; updated_at: string };

export type PlaceOption = {
  slug: string;
  name: string;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
  image: string | null;
  category: string | null;
};

export function daysInTrip(start: string, end: string) {
  const difference = Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`);
  return Number.isFinite(difference) ? Math.max(1, Math.min(61, Math.round(difference / 86400000) + 1)) : 1;
}

export function haversineKm(a: Pick<TripStop, "latitude" | "longitude">, b: Pick<TripStop, "latitude" | "longitude">) {
  if (a.latitude == null || a.longitude == null || b.latitude == null || b.longitude == null) return null;
  const radians = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * radians;
  const dLon = (b.longitude - a.longitude) * radians;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.latitude * radians) * Math.cos(b.latitude * radians) * Math.sin(dLon / 2) ** 2;
  return Math.round(12742 * Math.asin(Math.min(1, Math.sqrt(h))));
}

// A geographic suggestion, not a road route or live travel-time estimate.
export function suggestStopOrder(stops: TripStop[]): TripStop[] {
  if (stops.length < 3) return [...stops];
  const located = stops.filter((stop) => stop.latitude != null && stop.longitude != null);
  if (located.length < 3) return [...stops];
  let best: TripStop[] = [...located];
  let bestDistance = Infinity;
  for (const start of located) {
    const remaining = located.filter((item) => item.id !== start.id);
    const candidate = [start];
    while (remaining.length) {
      const last = candidate[candidate.length - 1];
      remaining.sort((a, b) => (haversineKm(last, a) ?? Infinity) - (haversineKm(last, b) ?? Infinity));
      candidate.push(remaining.shift()!);
    }
    const distance = candidate.slice(1).reduce((sum, item, index) => sum + (haversineKm(candidate[index], item) ?? 0), 0);
    if (distance < bestDistance) { best = candidate; bestDistance = distance; }
  }
  return [...best, ...stops.filter((stop) => stop.latitude == null || stop.longitude == null)];
}

export function defaultPacking(categories: (string | null)[]): PackingItem[] {
  const labels = ["Travel ID and booking details", "Phone charger and power bank", "Reusable water bottle", "Weather-appropriate clothing"];
  const joined = categories.join(" ").toLowerCase();
  if (/mountain|hill|snow/.test(joined)) labels.push("Warm layers and walking shoes");
  if (/beach|island/.test(joined)) labels.push("Sun protection and swimwear");
  if (/nature|wildlife|adventure/.test(joined)) labels.push("Comfortable outdoor footwear");
  return labels.map((label) => ({ id: crypto.randomUUID(), label, done: false }));
}
