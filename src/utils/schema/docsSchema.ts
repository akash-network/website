import { defineCollection, z } from "astro:content";

export const docsHomePage = defineCollection({
  schema: ({ image }) => {
    return z.object({
      pageLogo: image(),
      pageTitle: z.string(),
      description: z.string(),

      essentials: z.object({
        catTitle: z.string(),
        cards: z.array(
          z.object({
            title: z.string(),
            icon: image(),
            description: z.string(),
            link: z.string(),
          }),
        ),
      }),

      deployments: z.object({
        catTitle: z.string(),
        cards: z.array(
          z.object({
            title: z.string(),
            icon: image(),
            description: z.string(),
            link: z.string(),
          }),
        ),
      }),

      providers: z.object({
        catTitle: z.string(),
        cards: z.array(
          z.object({
            title: z.string(),
            icon: image(),
            description: z.string(),
            link: z.string(),
          }),
        ),
      }),
    });
  },
});

export const docsSchema = defineCollection({
  // Type-check frontmatter using a schema
  schema: ({ image }) => {
    return z.object({
      title: z.string(),
      linkTitle: z.string(),
      description: z.string().optional(),
      categories: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(),
      weight: z.number().optional(),
      hideTOC: z.boolean().optional(),
      hideFromNav: z.boolean().optional(),
    });
  },
});
