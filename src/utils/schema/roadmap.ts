import { defineCollection, z } from "astro:content";

export const roadmapSchema = defineCollection({
  schema: z.object({
    aep: z.number().optional(),
    title: z.string().optional(),
    author: z.string().optional(),
    status: z.string().optional(),
    type: z.string().optional(),
    category: z.string().optional(),
    created: z.coerce.date().optional(),
    updated: z.coerce.date().optional(),
    "estimated-completion": z.coerce.date().optional(),
    roadmap: z.enum(["major", "minor"]).optional(),
    "discussions-to": z.string().url().optional(),
    resolution: z.string().url().optional(),
    completed: z.coerce.date().optional(),
  }),
});
