import { docsSequence as docs } from "@/content/Docs/_sequence";
import React, { useState, useEffect, useRef } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";

export function DocsNav({ docsNav = [], pathName = [] }: any) {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [currentPath, setCurrentPath] = useState<string>(
    typeof window !== "undefined" ? window.location.pathname : ""
  );
  const [forceUpdate, setForceUpdate] = useState(0);
  const currentPathRef = useRef<string>(currentPath);

  // Preserve sidebar scroll position
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    let sidebar: HTMLElement | null = null;
    let scrollTimeout: NodeJS.Timeout;
    let isRestoring = false;
    let isUserScrolling = false;
    let userScrollTimeout: NodeJS.Timeout;
    let justNavigated = false;

    const getSidebar = () => {
      if (!sidebar || !document.contains(sidebar)) {
        sidebar = document.getElementById('docs-sidebar');
      }
      return sidebar;
    };

    // Save scroll position
    const saveScroll = () => {
      const el = getSidebar();
      if (el && !isRestoring) {
        const scrollPos = el.scrollTop;
        sessionStorage.setItem('docs-sidebar-scroll', scrollPos.toString());
      }
    };

    // Restore scroll position - very aggressive
    const restoreScroll = () => {
      const el = getSidebar();
      if (!el) {
        // Retry if sidebar not found
        setTimeout(restoreScroll, 10);
        return;
      }

      const saved = sessionStorage.getItem('docs-sidebar-scroll');
      if (saved === null) return;

      const targetPos = parseInt(saved, 10);
      if (isNaN(targetPos)) return;

      isRestoring = true;

      // Immediately set
      el.scrollTop = targetPos;

      // Use requestAnimationFrame for next frame
      requestAnimationFrame(() => {
        if (el) el.scrollTop = targetPos;
      });

      // Multiple delayed attempts (reduced)
      const attempts = [0, 10, 50, 100, 200];
      attempts.forEach((delay) => {
        setTimeout(() => {
          const currentEl = getSidebar();
          if (currentEl && !isUserScrolling) {
            currentEl.scrollTop = targetPos;
            if (delay === 200) {
              isRestoring = false;
            }
          }
        }, delay);
      });
    };

    // Initialize
    const init = () => {
      const el = getSidebar();
      if (!el) {
        setTimeout(init, 50);
        return;
      }

      // Restore on mount
      restoreScroll();

      // Save on scroll (throttled, but update immediately)
      let lastSavedPosition = el.scrollTop;
      const handleScrollSave = () => {
        if (isRestoring) return;
        lastSavedPosition = el.scrollTop;
        // Save immediately to prevent monitor from restoring old position
        sessionStorage.setItem('docs-sidebar-scroll', lastSavedPosition.toString());
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(saveScroll, 250);
        // Clear navigation flag when user scrolls
        justNavigated = false;
      };
      el.addEventListener('scroll', handleScrollSave, { passive: true });

      // Track when user is actively scrolling
      const handleUserScroll = () => {
        isUserScrolling = true;
        clearTimeout(userScrollTimeout);
        userScrollTimeout = setTimeout(() => {
          isUserScrolling = false;
        }, 150);
      };
      el.addEventListener('scroll', handleUserScroll, { passive: true });

      // Monitor and prevent unexpected scroll resets (only after navigation)
      const monitorScroll = setInterval(() => {
        // Don't interfere if user is actively scrolling or we're restoring
        if (isUserScrolling || isRestoring) return;
        
        // Only restore if we just navigated (not if user scrolled)
        if (!justNavigated) return;
        
        const currentEl = getSidebar();
        if (!currentEl) return;
        
        const currentPos = currentEl.scrollTop;
        const saved = sessionStorage.getItem('docs-sidebar-scroll');
        
        // Only restore if scroll was reset to 0 unexpectedly after navigation
        if (saved !== null && currentPos === 0 && parseInt(saved, 10) > 100) {
          // Only restore once
          isRestoring = true;
          currentEl.scrollTop = parseInt(saved, 10);
          setTimeout(() => {
            isRestoring = false;
            justNavigated = false; // Clear flag after restoration
          }, 50);
        } else if (currentPos > 0) {
          // If we're not at 0, clear the navigation flag
          justNavigated = false;
        }
      }, 200); // Check less frequently

      // Save before navigation
      document.addEventListener('astro:before-preparation', saveScroll);
      document.addEventListener('astro:before-swap', saveScroll);
      
      // Restore after navigation - with delays for React rendering (reduced)
      const handleAfterNav = () => {
        justNavigated = true; // Set flag that we just navigated
        setTimeout(restoreScroll, 0);
        setTimeout(restoreScroll, 50);
        setTimeout(restoreScroll, 150);
        setTimeout(restoreScroll, 300);
        // Clear flag after a short time
        setTimeout(() => {
          justNavigated = false;
        }, 1000);
      };
      
      document.addEventListener('astro:after-swap', handleAfterNav);
      document.addEventListener('astro:page-load', handleAfterNav);

      // Also watch for DOM changes (in case sidebar is recreated)
      const observer = new MutationObserver(() => {
        const saved = sessionStorage.getItem('docs-sidebar-scroll');
        if (saved !== null) {
          setTimeout(restoreScroll, 0);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      return () => {
        clearInterval(monitorScroll);
        clearTimeout(scrollTimeout);
        clearTimeout(userScrollTimeout);
        el?.removeEventListener('scroll', handleScrollSave);
        el?.removeEventListener('scroll', handleUserScroll);
        document.removeEventListener('astro:before-preparation', saveScroll);
        document.removeEventListener('astro:before-swap', saveScroll);
        document.removeEventListener('astro:after-swap', handleAfterNav);
        document.removeEventListener('astro:page-load', handleAfterNav);
        observer.disconnect();
      };
    };

    // Start initialization
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      setTimeout(init, 0);
    }
  }, []);

  const getCurrentLink = (link: string) => {
    if (typeof window === "undefined") {
      return false;
    }
    // Normalize both paths by removing trailing slashes for comparison
    const normalizedLink = link.replace(/\/$/, "");
    const normalizedCurrent = currentPath.replace(/\/$/, "");
    const isMatch = normalizedLink === normalizedCurrent;
    return isMatch;
  };

  // Keep ref in sync with state
  useEffect(() => {
    currentPathRef.current = currentPath;
  }, [currentPath]);

  // Auto-open sections that contain the current page
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const updateOpenSections = () => {
      const newPath = window.location.pathname;
      if (newPath !== currentPath) {
        setCurrentPath(newPath);
        setForceUpdate(prev => prev + 1); // Force re-render
      }
      const newOpenSections = new Set<string>();

      // Check if current path is within any section
      const checkPath = (items: any[], parentPath: string = ""): boolean => {
        let foundMatch = false;
        items.forEach((item) => {
          const fullPath = parentPath ? `${parentPath}/${item.label}` : item.label;
          if (item.link && newPath.startsWith(item.link)) {
            // Current page matches this item, open all parents
            newOpenSections.add(fullPath);
            foundMatch = true;
          }
          if (item.subItems && item.subItems.length > 0) {
            const hadMatch = checkPath(item.subItems, fullPath);
            // If a child matched, open this parent too
            if (hadMatch) {
              newOpenSections.add(fullPath);
              foundMatch = true;
            }
          }
        });
        return foundMatch;
      };

      const actualNav = docsNav[0]?.label === "Docs" ? docsNav[0].subItems : docsNav;
      checkPath(actualNav);
      
      // Also restore from sessionStorage
      try {
        const stored = sessionStorage.getItem("docs-open-sections");
        if (stored) {
          const storedArray = JSON.parse(stored);
          storedArray.forEach((path: string) => newOpenSections.add(path));
        }
      } catch (e) {
        // Ignore errors
      }
      
      setOpenSections(newOpenSections);
      sessionStorage.setItem("docs-open-sections", JSON.stringify(Array.from(newOpenSections)));
    };
    
    // Run on mount
    updateOpenSections();
    
    // Listen for Astro navigation events
    document.addEventListener('astro:page-load', updateOpenSections);
    document.addEventListener('astro:after-swap', updateOpenSections);
    
    // Also listen to popstate for back/forward navigation
    window.addEventListener('popstate', updateOpenSections);
    
    // Poll for changes as a fallback (every 300ms)
    const interval = setInterval(() => {
      const newPath = window.location.pathname;
      if (newPath !== currentPathRef.current) {
        updateOpenSections();
      }
    }, 300);
    
    return () => {
      document.removeEventListener('astro:page-load', updateOpenSections);
      document.removeEventListener('astro:after-swap', updateOpenSections);
      window.removeEventListener('popstate', updateOpenSections);
      clearInterval(interval);
    };
  }, [docsNav, pathName]);

  const getFirstLink = (item: any): string | null => {
    // If the item itself has a link (index page), use that
    if (item.link) {
      return item.link;
    }
    // Otherwise, if item has subItems, get the first sub-item's link
    if (item.subItems && item.subItems.length > 0) {
      // Get the first sub-item that has a link
      for (const subItem of item.subItems) {
        if (subItem.link) {
          return subItem.link;
        }
        // If sub-item has no link but has subItems, recurse
        if (subItem.subItems && subItem.subItems.length > 0) {
          const nestedLink = getFirstLink(subItem);
          if (nestedLink) {
            return nestedLink;
          }
        }
      }
    }
    return null;
  };

  const toggleSection = (sectionPath: string, item: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isOpen = openSections.has(sectionPath);
    
    if (isOpen) {
      // Close the section
      setOpenSections((prev) => {
        const next = new Set(prev);
        next.delete(sectionPath);
        // Update sessionStorage
        if (typeof window !== "undefined") {
          sessionStorage.setItem("docs-open-sections", JSON.stringify(Array.from(next)));
        }
        return next;
      });
    } else {
      // Open the section
      setOpenSections((prev) => {
        const next = new Set(prev);
        next.add(sectionPath);
        // Save to sessionStorage immediately
        if (typeof window !== "undefined") {
          sessionStorage.setItem("docs-open-sections", JSON.stringify(Array.from(next)));
        }
        return next;
      });
    }
  };

  // Skip the "Docs" wrapper - get the actual nav items
  const actualNav = docsNav[0]?.label === "Docs" ? docsNav[0].subItems : docsNav;
  
  // Get headers from sequence
  const { subItems: docsSequence } = docs[0];
  
  // Group nav items by headers
  const sections: Array<{ header?: string; items: any[] }> = [];
  let currentSection: { header?: string; items: any[] } = { items: [] };

  actualNav.forEach((navItem: any, index: number) => {
    // Check if there's a header before this item in the sequence
    const itemIndex = docsSequence.findIndex(
      (seqItem: any) => seqItem.label === navItem.label
    );
    
    if (itemIndex > 0) {
      const prevItem = docsSequence[itemIndex - 1];
      if (prevItem.type === "Header") {
        // Save current section and start new one
        if (currentSection.items.length > 0) {
          sections.push(currentSection);
        }
        currentSection = {
          header: prevItem.label,
          items: [],
        };
      }
    }

    currentSection.items.push(navItem);
  });

  // Add the last section
  if (currentSection.items.length > 0) {
    sections.push(currentSection);
  }

  const renderNavItem = (item: any, depth: number = 0, parentPath: string = ""): React.ReactNode => {
    const sectionPath = parentPath ? `${parentPath}/${item.label}` : item.label;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isOpen = openSections.has(sectionPath);
    const isActive = getCurrentLink(item.link || "");

    // Only highlight if this exact item is active (not its children)
    const isThisPageActive = item.link && getCurrentLink(item.link);

    if (hasSubItems) {
      // This is a collapsible section
      return (
        <div key={item.label || item.link} className={depth === 0 ? "mt-6 first:mt-0" : ""}>
          {depth === 0 ? (
            // Top-level section header (like "Getting Started", "For Developers")
            <>
              <h3 className="mb-3 text-base font-bold text-foreground">
                {item.label}
              </h3>
              <div className="space-y-1">
                {item.subItems.map((subItem: any) => renderNavItem(subItem, depth + 1, sectionPath))}
              </div>
            </>
          ) : (
            // Nested collapsible section (like "Akash Console" with sub-items)
            <>
              <div
                className={`flex w-full items-center rounded-md transition-colors ${
                  isThisPageActive
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                    : "text-para hover:bg-gray-100 hover:text-foreground dark:hover:bg-background2 dark:hover:text-white"
                }`}
              >
                <a
                  href={getFirstLink(item) || "#"}
                  className="flex-1 px-3 py-2 text-sm font-medium"
                >
                  {item.label}
                </a>
                <button
                  type="button"
                  onClick={(e) => toggleSection(sectionPath, item, e)}
                  className="px-3 py-2"
                  aria-label={isOpen ? "Collapse section" : "Expand section"}
                >
                  {isOpen ? (
                    <ChevronDownIcon className="h-4 w-4" />
                  ) : (
                    <ChevronRightIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
              {isOpen && (
                <div className="ml-4 mt-1 space-y-1 border-l border-border pl-4">
                  {item.subItems.map((subItem: any) => renderNavItem(subItem, depth + 1, sectionPath))}
                </div>
              )}
            </>
          )}
        </div>
      );
    }

    // Leaf node - just a link
    return (
      <a
        key={item.link}
        href={item.link}
        className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
            : "text-para hover:bg-gray-100 hover:text-foreground dark:hover:bg-background2 dark:hover:text-white"
        }`}
      >
        {item.label}
      </a>
    );
  };

  return (
    <nav className="space-y-8">
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex}>
          {section.header && (
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-para border-t pt-6 first:border-t-0 first:pt-0">
              {section.header}
            </h2>
          )}
          <div className="space-y-6">
            {section.items.map((item) => renderNavItem(item))}
          </div>
        </div>
      ))}
    </nav>
  );
}

export const HomeButton = ({ pathname }: { pathname: string }) => {
  const isActive = pathname === "/docs/" || pathname === "/docs";
  return (
    <a
      href="/docs/"
      className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
          : "text-para hover:bg-gray-100 hover:text-foreground dark:hover:bg-background2 dark:hover:text-white"
      }`}
    >
      Home
    </a>
  );
};
