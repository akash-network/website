import { defineCollection, z } from "astro:content";

export const gettingStartedPage = defineCollection({
  // Type-check frontmatter using a schema
  schema: ({ image }) => {
    return z.object({
      pageTitle: z.string(),

      getStartedSection: z.object({
        cards: z.array(
          z.object({
            title: z.string(),
            image: z.object({
              link: image(),
              width: z.string().optional(),
            }),
            darkImage: z.object({
              link: image(),
              width: z.string().optional(),
            }),
            description: z.string(),
            link: z.string(),
            linkIcon: z.boolean(),
            linkLabel: z.string(),
            button: z
              .object({
                label: z.string(),
                link: z.string(),
                enable: z.boolean(),
              })
              .optional(),
          }),
        ),
      }),

      communitySection: z.object({
        title: z.string(),
        cards: z.array(
          z.object({
            title: z.string(),
            description: z.string(),
            badge: image(),
            link: z.string(),
            linkIcon: z.boolean(),
            linkLabel: z.string(),
            button: z
              .object({
                icon: z.boolean(),
                label: z.string(),
                link: z.string(),
                enable: z.boolean(),
              })
              .optional(),
          }),
        ),
      }),
    });
  },
});
