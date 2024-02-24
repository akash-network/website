import { aboutSchema } from "@/utils/schema/about";
import {
  brandReleasesInsightsSchema,
  brandResourcesSchema,
  pressSchema,
} from "@/utils/schema/brandPages";
import {
  communityAkashEduSchema,
  communityContributionsSchema,
  communityEventSchema,
} from "@/utils/schema/communityContributions";
import { communityGroupsSchema } from "@/utils/schema/communityGroups";
import { communityPagesSchema } from "@/utils/schema/communityPages";
import { deployPage } from "@/utils/schema/deploy_page";
import { developmentSchema } from "@/utils/schema/development";
import { docsHomePage, docsSchema } from "@/utils/schema/docsSchema";
import { ecosystemSchema } from "@/utils/schema/ecosystem";
import { privacySchema } from "@/utils/schema/privacy";
import { providersPage } from "@/utils/schema/provides_page";
import { tokenPage } from "@/utils/schema/token_page";
import { defineCollection, z } from "astro:content";

//homepage schema
const homePage = defineCollection({
  // Type-check frontmatter using a schema
  schema: ({ image }) => {
    return z.object({
      heroSection: z.object({
        title: z.string(),
        description: z.string(),
        primaryButton: z.object({
          label: z.string(),
          link: z.string(),
          enable: z.boolean(),
        }),
        secondaryButton: z.object({
          label: z.string(),
          link: z.string(),
          enable: z.boolean(),
        }),
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

//blog schema
const blog = defineCollection({
  // Type-check frontmatter using a schema
  schema: ({ image }) => {
    return z.object({
      // Required fields
      title: z.string(),
      description: z.string(),
      // Transform string to Date object
      pubDate: z.coerce.date(),
      draft: z.coerce.boolean(),
      categories: z.array(z.string()),
      tags: z.array(z.string()),
      contributors: z.array(z.string()),
      bannerImage: image(),

      // Optional fields
      updatedDate: z.coerce.date().optional(),
      pinned: z.coerce.date().optional(),
      homepage: z.coerce.date().optional(),
      archive: z.boolean().optional(),

      // SEO
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      // comma separated values ex: "tech, cloud, hosting, ai"
      metaKeywords: z.string().optional(),
    });
  },
});

export const collections = {
  Blog: blog,
  Homepage: homePage,

  Token_Homepage: tokenPage,
  Deploy_Homepage: deployPage,
  Providers_Homepage: providersPage,
  Development_Page: developmentSchema,
  About_Page: aboutSchema,
  Brand_Resources_Homepage: brandResourcesSchema,
  Brand_Releases_Insights_Homepage: brandReleasesInsightsSchema,
  // Press_Page: pressSchema,
  Community_Page: communityPagesSchema,
  Privacy_Homepage: privacySchema,
  Community_Contributions_Page: communityContributionsSchema,
  Community_Akash_Edu_Page: communityAkashEduSchema,
  Community_Akash_Events_Page: communityEventSchema,
  Development_Current_Groups_Page: communityGroupsSchema,
  // Docs_Homepage: docsHomePage,
  Docs: docsSchema,
  Ecosystem_Page: ecosystemSchema,
};
