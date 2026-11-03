import { defineCollection, z } from "astro:content";
import { contentLoader } from "@/utils/schema/contentLoader";

export const deployPage = defineCollection({
  loader: contentLoader("Deploy_Homepage"),
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
        }),
      }),

      cloudmosResourcesSection: z.object({
        title: z.string(),
        cards: z.array(
          z.object({
            title: z.string(),
            description: z.string(),
            link: z.string(),
            linkLabel: z.string(),
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
