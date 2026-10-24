import { z } from "zod";

export const socialIdSchema = z.string().uuid();
export const commentSchema = z.string().trim().min(2, "Write at least 2 characters.").max(1000, "Keep comments under 1,000 characters.");
