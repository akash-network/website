import { getCollection, type CollectionEntry } from "astro:content";

// Cache for the lastmod map to avoid rebuilding it multiple times
let lastmodMapCache: Map<string, Date> | null = null;

/**
 * Maps content collection entries to their URL paths and lastmod dates
 * @returns A Map of URL paths to Date objects representing lastmod
 */
export async function getLastmodMap(): Promise<Map<string, Date>> {
  // Return cached map if available
  if (lastmodMapCache) {
    return lastmodMapCache;
  }

  const lastmodMap = new Map<string, Date>();

  // Helper function to get lastmod date from entry data
  const getLastmodFromEntry = (entry: { data: Record<string, any> }): Date | null => {
    const data = entry.data;
    // Use updatedDate if available, otherwise pubDate
    if (data.updatedDate) {
      return data.updatedDate instanceof Date ? data.updatedDate : new Date(data.updatedDate);
    }
    if (data.pubDate) {
      return data.pubDate instanceof Date ? data.pubDate : new Date(data.pubDate);
    }
    // For roadmap entries, check for updated or created dates
    if (data.updated) {
      return data.updated instanceof Date ? data.updated : new Date(data.updated);
    }
    if (data.created) {
      return data.created instanceof Date ? data.created : new Date(data.created);
    }
    return null;
  };

  // Blog collection: /blog/{slug}/ and /case-studies/{slug}/
  // Case studies are also Blog posts but accessed via /case-studies/ route
  try {
    const blogEntries = await getCollection("Blog");
    for (const entry of blogEntries) {
      const lastmod = getLastmodFromEntry(entry);
      if (lastmod) {
        // Regular blog posts
        lastmodMap.set(`/blog/${entry.slug}/`, lastmod);
        
        // Case studies are also blog posts but have a different route
        const isCaseStudy = (entry.data as any).categories?.some(
          (category: string) => category.toLowerCase() === "case studies"
        );
        if (isCaseStudy) {
          lastmodMap.set(`/case-studies/${entry.slug}/`, lastmod);
        }
      }
    }
  } catch (error) {
    console.warn("Could not load Blog collection:", error);
  }

  // Docs collection: /docs/{slug}/
  // Note: Docs don't have pubDate, so we'll skip them (file mtime will be used)
  try {
    const docsEntries = await getCollection("Docs");
    // Docs don't have date fields, so we skip them
    // They'll use file modification time automatically
  } catch (error) {
    console.warn("Could not load Docs collection:", error);
  }

  // Community_Page collection: /community/{slug}/
  try {
    const communityEntries = await getCollection("Community_Page");
    for (const entry of communityEntries) {
      const lastmod = getLastmodFromEntry(entry);
      if (lastmod) {
        lastmodMap.set(`/community/${entry.slug}/`, lastmod);
      }
    }
  } catch (error) {
    console.warn("Could not load Community_Page collection:", error);
  }

  // Development_Page collection: /development/{slug}/
  try {
    const developmentEntries = await getCollection("Development_Page");
    for (const entry of developmentEntries) {
      const lastmod = getLastmodFromEntry(entry);
      if (lastmod) {
        lastmodMap.set(`/development/${entry.slug}/`, lastmod);
      }
    }
  } catch (error) {
    console.warn("Could not load Development_Page collection:", error);
  }

  // About_Page collection: /about/{slug}/
  try {
    const aboutEntries = await getCollection("About_Page");
    for (const entry of aboutEntries) {
      const lastmod = getLastmodFromEntry(entry);
      if (lastmod) {
        lastmodMap.set(`/about/${entry.slug}/`, lastmod);
      }
    }
  } catch (error) {
    console.warn("Could not load About_Page collection:", error);
  }

  // Development_Current_Groups_Page collection: /current-groups/{slug}/
  try {
    const currentGroupsEntries = await getCollection("Development_Current_Groups_Page");
    for (const entry of currentGroupsEntries) {
      const lastmod = getLastmodFromEntry(entry);
      if (lastmod) {
        lastmodMap.set(`/current-groups/${entry.slug}/`, lastmod);
      }
    }
  } catch (error) {
    console.warn("Could not load Development_Current_Groups_Page collection:", error);
  }

  // aeps (roadmap) collection: /roadmap/{slug}/
  // Note: The slug is split, so we use the first part
  try {
    const roadmapEntries = await getCollection("aeps");
    for (const entry of roadmapEntries) {
      const lastmod = getLastmodFromEntry(entry);
      if (lastmod && entry.slug) {
        // The roadmap slug is split, so we use the first part
        const slugPart = entry.slug.split("/")[0];
        lastmodMap.set(`/roadmap/${slugPart}/`, lastmod);
      }
    }
  } catch (error) {
    console.warn("Could not load aeps collection:", error);
  }

  // Ecosystem_Page collection
  // Note: Ecosystem_Page entries are used in listing pages, not individual pages
  // So we skip them as they don't have individual routes
  // If individual pages are added in the future, uncomment and adjust the URL pattern below
  // try {
  //   const ecosystemEntries = await getCollection("Ecosystem_Page");
  //   for (const entry of ecosystemEntries) {
  //     const lastmod = getLastmodFromEntry(entry);
  //     if (lastmod) {
  //       lastmodMap.set(`/ecosystem/deployed-on-akash/${entry.slug}/`, lastmod);
  //     }
  //   }
  // } catch (error) {
  //   console.warn("Could not load Ecosystem_Page collection:", error);
  // }

  // Community_Contributions_Page and Community_Akash_Events_Page
  // These are typically used in listing pages, not individual pages
  // So we skip them unless they have individual pages

  // Cache the result
  lastmodMapCache = lastmodMap;
  return lastmodMap;
}

/**
 * Synchronous version that returns the cached map or null
 * Use this in serialize function if the map has been built
 */
export function getLastmodMapSync(): Map<string, Date> | null {
  return lastmodMapCache;
}
