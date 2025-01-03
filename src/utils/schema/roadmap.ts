import { defineCollection, z } from "astro:content";

export const roadmapSchema = defineCollection({
  schema: z.object({
    aep: z.number(),
    title: z.string(),
    author: z.string(),
    status: z.string(),
    type: z.string(),
    category: z.string().optional(),
    created: z.coerce.date(),
    updated: z.coerce.date().optional(),
    "estimated-completion": z.coerce.date().optional(),
    roadmap: z.enum(["major", "minor"]).optional(),
    "discussions-to": z.string().url().optional(),
    resolution: z.string().url().optional(),
    completed: z.coerce.date().optional(),
  }),
});
