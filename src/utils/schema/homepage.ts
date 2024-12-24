import { defineCollection, z } from "astro:content";

export const homePageSchema = defineCollection({
  schema: ({ image }) => {
    return z.object({
      advert: z.object({
        title: z.string(),
        link: z.string(),
      }),
      heroSection: z.object({
        title: z.string(),
        description: z.string(),
        cards: z.array(
          z.object({
            title: z.string(),
            description: z.string(),
            buttons: z.array(
              z.object({
                label: z.string(),
                link: z.string(),
                type: z.union([z.literal("primary"), z.literal("secondary")]),
              }),
            ),
          }),
        ),
      }),
      infrastructureSection: z.object({
        title: z.string(),
        cards: z.array(
          z.object({
            title: z.string(),
            image: image(),
            description: z.string(),
          }),
        ),
      }),
      featureSection: z.object({
        cards: z.array(
          z.object({
            id: z.number(),
            title: z.string(),
            description: z.string(),
            image: image(),
            darkImage: image().optional(),
          }),
        ),
      }),
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
      aiModelsAndAppsSection: z.object({
        title: z.string(),
        description: z.string(),
        subtitle1: z.string(),
        subtitle2: z.string(),
        cards1: z.array(
          z.object({
            title: z.string(),
            description: z.string(),
            link: z.string(),
            image: image(),
          }),
        ),
        cards2: z.array(
          z.object({
            title: z.string(),
            description: z.string(),
            image: image(),
            link: z.string(),
            darkImage: image().optional(),
          }),
        ),
        cards3: z.array(
          z.object({
            description: z.string(),
            image: image(),
            logoTitle: z.string(),
            darkImage: image().optional(),
            launchAppLink: z
              .object({
                label: z.string(),
                link: z.string(),
              })
              .optional(),
            docsLink: z
              .object({
                label: z.string(),
                link: z.string(),
              })
              .optional(),
            githubLink: z
              .object({
                label: z.string(),
                link: z.string(),
              })
              .optional(),
          }),
        ),
      }),
      testimonialsSection: z.object({
        title: z.string(),
        description: z.string(),
        discordButton: z.object({
          label: z.string(),
          link: z.string(),
          enable: z.boolean(),
        }),
        githubButton: z.object({
          label: z.string(),
          link: z.string(),
          enable: z.boolean(),
        }),
        testimonials: z.array(
          z.object({
            userName: z.string(),
            useAvatar: z.string(),
            testimonial: z.string(),
            accountLink: z.string().optional(),
            companyName: z.string().optional(),
          }),
        ),
      }),
      CTASection: z.object({
        title: z.string(),
        button: z.object({
          label: z.string(),
          link: z.string(),
          enable: z.boolean(),
        }),
      }),
    });
  },
});
