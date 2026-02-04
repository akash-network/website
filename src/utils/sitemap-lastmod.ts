import { execSync } from "child_process";
import { statSync } from "fs";
import { join } from "path";

// Get project root directory
const projectRoot = process.cwd();

// GitHub repo info
const GITHUB_REPO = "akash-network/website";
const GITHUB_API_BASE = "https://api.github.com/repos";

// Cache for GitHub API responses to avoid rate limiting
const githubCache = new Map<string, Date | null>();

/**
 * Gets the last modification time for a file using GitHub API
 * Falls back to git, then filesystem
 */
async function getFileModTime(filePath: string): Promise<Date | null> {
  const fullPath = join(projectRoot, filePath);

  // Check cache first
  if (githubCache.has(filePath)) {
    return githubCache.get(filePath) || null;
  }

  // Try GitHub API first (most reliable, works in CI/CD)
  try {
    const apiUrl = `${GITHUB_API_BASE}/${GITHUB_REPO}/commits?path=${encodeURIComponent(filePath)}&per_page=1`;

    // Add timeout to avoid hanging during build
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    try {
      const response = await fetch(apiUrl, {
        signal: controller.signal,
        headers: {
          Accept: "application/vnd.github.v3+json",
          // Optional: Add token if available for higher rate limits
          ...(process.env.GITHUB_TOKEN && {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
          }),
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const commits = await response.json();
        if (Array.isArray(commits) && commits.length > 0) {
          const commitDate = new Date(commits[0].commit.committer.date);
          githubCache.set(filePath, commitDate);
          return commitDate;
        }
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    // GitHub API failed (network error, timeout, etc.), continue to fallback methods
  }

  // Fallback to local git
  try {
    const result = execSync(
      `git log -1 --pretty="format:%cI" -- "${fullPath}" 2>/dev/null || echo ""`,
      { encoding: "utf-8", cwd: projectRoot },
    ).trim();

    if (result) {
      const date = new Date(result);
      githubCache.set(filePath, date);
      return date;
    }
  } catch (error) {
    // Git not available, continue to filesystem
  }

  // Final fallback to filesystem modification time
  try {
    const stats = statSync(fullPath);
    const date = stats.mtime;
    githubCache.set(filePath, date);
    return date;
  } catch (error) {
    // File doesn't exist or can't be accessed
    githubCache.set(filePath, null);
    return null;
  }
}

/**
 * Gets the lastmod date for a sitemap entry based on its URL
 */
export async function getLastModForUrl(url: string): Promise<Date | undefined> {
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
    const modTime = await getFileModTime(indexPath);
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

  for (const pagePath of possiblePaths) {
    const modTime = await getFileModTime(pagePath);
    if (modTime) {
      return modTime;
    }
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
      for (const blogPath of possibleBlogPaths) {
        const modTime = await getFileModTime(blogPath);
        if (modTime) {
          return modTime;
        }
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
      for (const docPath of possibleDocPaths) {
        const modTime = await getFileModTime(docPath);
        if (modTime) {
          return modTime;
        }
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
      for (const caseStudyPath of possibleCaseStudyPaths) {
        const modTime = await getFileModTime(caseStudyPath);
        if (modTime) {
          return modTime;
        }
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
        const modTime = await getFileModTime(yearPagePath);
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
        for (const roadmapPath of possibleRoadmapPaths) {
          const modTime = await getFileModTime(roadmapPath);
          if (modTime) {
            return modTime;
          }
        }
        // Also check the page file that generates AEP pages
        const aepPagePath = `src/pages/roadmap/[slug]/index.astro`;
        const pageModTime = await getFileModTime(aepPagePath);
        if (pageModTime) {
          return pageModTime;
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
      const modTime = await getFileModTime(pagePath);
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
    for (const pagePath of possiblePagePaths) {
      const modTime = await getFileModTime(pagePath);
      if (modTime) {
        return modTime;
      }
    }
  }

  return undefined;
}
