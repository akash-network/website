import { defineCollection, z } from "astro:content";

export const roadmapSchema = defineCollection({
  schema: z.object({
    aep: z.number(),
    title: z.string(),
    author: z.string(),
    status: z.string(),
    type: z.string(),
    category: z.string(),
    created: z.coerce.date(),
    updated: z.coerce.date(),
    "estimated-completion": z.coerce.date(),
    roadmap: z.enum(["major", "minor"]),
    "discussions-to": z.string().url(),
    resolution: z.string().url(),
  }),
});
