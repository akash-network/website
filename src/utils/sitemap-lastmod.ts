import { existsSync, readFileSync } from "fs";
import { join } from "path";

// Get project root directory
const projectRoot = process.cwd();
const cacheFile = join(projectRoot, ".lastmod-cache.json");

interface LastModCache {
  [filePath: string]: string; // ISO date string
}

// Load cache file once
let cache: LastModCache | null = null;

/**
 * Load the lastmod cache from file
 */
function loadCache(): LastModCache {
  if (cache !== null) {
    return cache;
  }

  if (existsSync(cacheFile)) {
    try {
      const content = readFileSync(cacheFile, "utf-8");
      cache = JSON.parse(content);
      return cache || {};
    } catch (error) {
      console.warn(`Failed to load lastmod cache: ${error}`);
      cache = {};
      return {};
    }
  }

  cache = {};
  return {};
}

/**
 * Gets the last modification time for a file from the cache
 */
function getFileModTime(filePath: string): Date | null {
  const cacheData = loadCache();
  const lastModString = cacheData[filePath];
  if (lastModString) {
    return new Date(lastModString);
  }
  return null;
}

/**
 * Gets the most recent modification time from a list of file paths
 */
function getMostRecentModTime(filePaths: string[]): Date | null {
  const dates: Date[] = [];
  for (const filePath of filePaths) {
    const modTime = getFileModTime(filePath);
    if (modTime) {
      dates.push(modTime);
    }
  }
  if (dates.length === 0) {
    return null;
  }
  return new Date(Math.max(...dates.map((d) => d.getTime())));
}

/**
 * Gets related component paths for a given route
 */
function getRelatedComponentPaths(route: string): string[] {
  const componentPaths: string[] = [];
  const routeParts = route.split("/").filter(Boolean);
  const baseRoute = routeParts[0] || "";

  // Common/shared components that affect all pages
  const commonComponents = [
    "src/components/base-head.astro",
    "src/components/header",
    "src/components/footer",
    "src/components/dark-mode-toggle.astro",
    "src/components/dark-mode-toggle.tsx",
  ];

  // Route-specific component directories
  const routeComponentMap: Record<string, string[]> = {
    blog: ["src/components/blog"],
    docs: ["src/components/docs"],
    "case-studies": ["src/components/blog"], // case studies use blog components
    roadmap: ["src/components/roadmap"],
    community: ["src/components/community-pages"],
    ecosystem: ["src/components/ecosystem-pages"],
    about: ["src/components/about-pages"],
    pricing: ["src/components/pricing-page"],
    providers: ["src/components/providers-page"],
    token: ["src/components/token-page"],
    deploy: ["src/components/deploy-page"],
    development: ["src/components/development-pages"],
    brand: ["src/components/brand-pages"],
    home: ["src/components/home"],
    accelerate: ["src/components/accelerate"],
    "akash-accelerate-2024": ["src/components/acc-2025"],
    "akash-accelerate-2025": ["src/components/acc-2025"],
    neurips: ["src/components/neurips"],
    "gpus-on-demand": ["src/components/gpus-on-demand"],
    "nvidia-blackwell-gpus": ["src/components/blackwell"],
  };

  // Add common components
  componentPaths.push(...commonComponents);

  // Add route-specific components
  if (baseRoute && routeComponentMap[baseRoute]) {
    componentPaths.push(...routeComponentMap[baseRoute]);
  }

  return componentPaths;
}

/**
 * Gets the lastmod for a page, considering both the page file and related components
 */
function getPageLastModWithComponents(
  pagePaths: string[],
  route: string,
): Date | null {
  const allPaths: string[] = [...pagePaths];

  // Get related component paths
  const componentPaths = getRelatedComponentPaths(route);

  // For component directories, we need to check all files in the cache that match
  const cacheData = loadCache();
  for (const componentPath of componentPaths) {
    // If it's a directory path (doesn't have a file extension), find all matching component files
    if (!componentPath.includes(".") || componentPath.endsWith("/")) {
      // Find all component files that start with this path
      const normalizedPath = componentPath.endsWith("/")
        ? componentPath
        : `${componentPath}/`;
      for (const cachedPath of Object.keys(cacheData)) {
        if (cachedPath.startsWith(normalizedPath)) {
          allPaths.push(cachedPath);
        }
      }
    } else {
      // It's a specific file
      allPaths.push(componentPath);
    }
  }

  return getMostRecentModTime(allPaths);
}

/**
 * Gets the lastmod date for a sitemap entry based on its URL
 */
export function getLastModForUrl(url: string): Date | undefined {
  // Parse URL - handle both full URLs and pathname strings
  let pathname: string;
  try {
    // Try parsing as full URL first
    pathname = new URL(url).pathname;
  } catch {
    // If that fails, assume it's already a pathname
    pathname = url.startsWith("/") ? url : `/${url}`;
  }

  // Handle root
  if (pathname === "/" || pathname === "") {
    const indexPath = "src/pages/index.astro";
    const modTime = getPageLastModWithComponents([indexPath], "");
    return modTime || undefined;
  }

  // Remove leading slash
  const cleanPath = pathname.startsWith("/") ? pathname.slice(1) : pathname;

  // Try to find the corresponding page file
  // Handle static pages first
  const possiblePaths = [
    `src/pages/${cleanPath}.astro`,
    `src/pages/${cleanPath}/index.astro`,
    `src/pages/${cleanPath.replace(/\/$/, "")}.astro`,
  ];

  // Check page files and related components
  const pageModTime = getPageLastModWithComponents(possiblePaths, cleanPath);
  if (pageModTime) {
    return pageModTime;
  }

  // Handle content collection pages (blog, docs, etc.)
  // For blog posts: /blog/[slug] -> check content file
  if (cleanPath.startsWith("blog/")) {
    const slug = cleanPath.replace("blog/", "").replace(/\/$/, "");
    if (slug && !slug.includes("/")) {
      // Blog posts are stored in directories with index.md
      const possibleBlogPaths = [
        `src/content/Blog/${slug}/index.md`,
        `src/content/Blog/${slug}/index.mdx`,
        `src/content/Blog/${slug}.md`,
        `src/content/Blog/${slug}.mdx`,
      ];
      // Check blog content files and related components
      const blogModTime = getPageLastModWithComponents(
        possibleBlogPaths,
        cleanPath,
      );
      if (blogModTime) {
        return blogModTime;
      }
    }
  }

  // For docs: /docs/[...slug] -> check content file
  if (cleanPath.startsWith("docs/")) {
    const slug = cleanPath.replace("docs/", "").replace(/\/$/, "");
    if (slug) {
      // Docs can be nested, so try different paths
      const possibleDocPaths = [
        `src/content/Docs/${slug}/index.md`,
        `src/content/Docs/${slug}/index.mdx`,
        `src/content/Docs/${slug}.md`,
        `src/content/Docs/${slug}.mdx`,
        // Handle nested paths
        `src/content/Docs/${slug.replace(/\//g, "/")}/index.md`,
        `src/content/Docs/${slug.replace(/\//g, "/")}/index.mdx`,
      ];
      // Check doc content files and related components
      const docModTime = getPageLastModWithComponents(
        possibleDocPaths,
        cleanPath,
      );
      if (docModTime) {
        return docModTime;
      }
    }
  }

  // For case studies: /case-studies/[slug]
  if (cleanPath.startsWith("case-studies/")) {
    const slug = cleanPath.replace("case-studies/", "").replace(/\/$/, "");
    if (slug && !slug.includes("/")) {
      // Only check if it's a single slug (not paginated)
      // Case studies are also stored in Blog collection
      const possibleCaseStudyPaths = [
        `src/content/Blog/${slug}/index.md`,
        `src/content/Blog/${slug}/index.mdx`,
        `src/content/Blog/${slug}.md`,
        `src/content/Blog/${slug}.mdx`,
      ];
      // Check case study content files and related components
      const caseStudyModTime = getPageLastModWithComponents(
        possibleCaseStudyPaths,
        cleanPath,
      );
      if (caseStudyModTime) {
        return caseStudyModTime;
      }
    }
  }

  // For roadmap: /roadmap/[slug] or /roadmap/[year]
  if (cleanPath.startsWith("roadmap/")) {
    const slug = cleanPath.replace("roadmap/", "").replace(/\/$/, "");
    if (slug) {
      // Check if it's a year page (e.g., /roadmap/2018/)
      // Year pages are generated by src/pages/roadmap/[year]/index.astro
      if (/^\d{4}$/.test(slug)) {
        const yearPagePath = `src/pages/roadmap/[year]/index.astro`;
        const modTime = getPageLastModWithComponents([yearPagePath], cleanPath);
        if (modTime) {
          return modTime;
        }
      } else {
        // AEP pages - roadmap entries use README.md files
        const possibleRoadmapPaths = [
          `src/content/aeps/${slug}/README.md`,
          `src/content/aeps/${slug}/index.md`,
          `src/content/aeps/${slug}/index.mdx`,
          `src/content/aeps/${slug}.md`,
          `src/content/aeps/${slug}.mdx`,
        ];
        // Also check the page file that generates AEP pages
        const aepPagePath = `src/pages/roadmap/[slug]/index.astro`;
        const roadmapModTime = getPageLastModWithComponents(
          [...possibleRoadmapPaths, aepPagePath],
          cleanPath,
        );
        if (roadmapModTime) {
          return roadmapModTime;
        }
      }
    }
  }

  // Handle pagination pages (e.g., /blog/2/, /blog/ai-&-ml/1/)
  // These are generated by pagination, so use the parent page file
  const routeParts = cleanPath.split("/");
  if (routeParts.length >= 2) {
    const baseRoute = routeParts[0];
    // Check for pagination pattern: /blog/2/, /blog/ai-&-ml/1/, etc.
    const lastPart = routeParts[routeParts.length - 1];
    if (/^\d+$/.test(lastPart)) {
      // It's a pagination page, use the parent page file
      const pagePath = `src/pages/${baseRoute}/[...page].astro`;
      const modTime = getPageLastModWithComponents([pagePath], cleanPath);
      if (modTime) {
        return modTime;
      }
    }
  }

  // Default: try to find the page file that generates this route
  // This handles dynamic routes that might have a parent page file
  if (routeParts.length > 0) {
    const baseRoute = routeParts[0];
    const possiblePagePaths = [
      `src/pages/${baseRoute}/[...slug].astro`,
      `src/pages/${baseRoute}/[...page].astro`,
      `src/pages/${baseRoute}/index.astro`,
    ];
    const defaultModTime = getPageLastModWithComponents(
      possiblePagePaths,
      cleanPath,
    );
    if (defaultModTime) {
      return defaultModTime;
    }
  }

  return undefined;
}
