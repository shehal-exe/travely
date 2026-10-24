import { z } from "zod";

export const memorySchema = z.object({
  title: z.string().trim().min(3).max(120),
  destinationId: z.union([z.uuid(), z.literal("")]).optional(),
  destinationName: z.string().trim().min(2).max(120),
  locationVisited: z.string().trim().min(2).max(160),
  country: z.string().trim().min(2).max(80),
  travelDate: z.string().date().refine((date) => date <= new Date().toISOString().slice(0, 10), "Travel date cannot be in the future."),
  description: z.string().trim().min(40).max(5000),
  travelTips: z.string().trim().max(2000).optional(),
  rating: z.coerce.number().int().min(1).max(5),
  category: z.string().trim().max(60).optional(),
  totalExpense: z.coerce.number().nonnegative().max(10_000_000).optional(),
  daysSpent: z.coerce.number().int().min(1).max(365).optional(),
  tripStyle: z.string().trim().max(80).optional(),
  authorNote: z.string().trim().max(300).optional(),
  visibility: z.enum(["public", "private"]),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
});

export type MemoryInput = z.infer<typeof memorySchema>;

export const imageRules = {
  maxFiles: 8,
  maxBytes: 8 * 1024 * 1024,
  accepted: ["image/jpeg", "image/png", "image/webp", "image/avif"],
};

export function validateImages(files: File[]) {
  if (files.length > imageRules.maxFiles) return "Upload up to 8 images.";
  const invalid = files.find(
    (file) =>
      file.size > imageRules.maxBytes || !imageRules.accepted.includes(file.type),
  );
  return invalid
    ? "Images must be JPG, PNG, WebP, or AVIF and no larger than 8 MB."
    : null;
}
