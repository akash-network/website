import { defineCollection, z } from "astro:content";

export const deployPage = defineCollection({
  // Type-check frontmatter using a schema
  schema: ({ image }) => {
    return z.object({
      pageTitle: z.string(),

      heroSection: z.object({
        title: z.string(),
        description: z.string(),
        heroImage: image(),
        featureList: z.array(z.string()),
        button: z.object({
          label: z.string(),
          link: z.string(),
          enable: z.boolean(),
        }),
      }),

      cloudmosResourcesSection: z.object({
        title: z.string(),
        cards: z.array(
          z.object({
            title: z.string(),
            description: z.string(),
            badge: image(),
            link: z.string(),
            linkIcon: z.boolean(),
            linkLabel: z.string(),
          }),
        ),
      }),

      resourcesSection: z.object({
        title: z.string(),
        cards: z.array(
          z.object({
            title: z.string(),
            description: z.string(),
            img: image(),
            link: z.string().optional(),
          }),
        ),
      }),

      additionalDeploymentSection: z.object({
        title: z.string(),
        resources: z.array(
          z.object({
            title: z.string(),
            content: z.string(),
            link: z.string(),
          }),
        ),
      }),
    });
  },
});
