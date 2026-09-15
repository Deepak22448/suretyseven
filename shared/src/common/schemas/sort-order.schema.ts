import { z } from "zod";

export const SORT_ORDERS = ["asc", "desc"] as const;
export const SortOrderSchema = z.enum(SORT_ORDERS);
export type SortOrder = z.infer<typeof SortOrderSchema>;
