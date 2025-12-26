import { useEffect, useState, useRef } from "react";
import type { TocItem } from "../../lib/generateToc";

interface Props {
  toc: TocItem[];
  labels: {
    onThisPage: string;
  };
}

const TableOfContents = ({ toc = [], labels }: Props) => {
  // Initialize the current heading state with the first item from the TOC.
  const [currentHeading, setCurrentHeading] = useState({
    slug: toc[0].slug,
    text: toc[0].text,
  });

  // Track if user is actively scrolling to prevent interference
  const isUserScrollingRef = useRef(false);

  // Track if user is actively scrolling to prevent interference
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      isUserScrollingRef.current = true;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isUserScrollingRef.current = false;
      }, 200);
    };

    // Listen to main page scroll
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  useEffect(() => {
    // Don't auto-scroll if user is actively scrolling
    if (isUserScrollingRef.current) {
      return;
    }

    // Use a timeout to debounce and allow scroll detection to settle
    const timeoutId = setTimeout(() => {
      // Don't scroll if user started scrolling during the timeout
      if (isUserScrollingRef.current) {
        return;
      }

      // Auto-scroll the active heading into view only if it's not visible
      if (currentHeading.slug) {
        const activeElement = document.querySelector(
          `aside a[href="#${currentHeading.slug}"]`,
        ) as HTMLElement;

        if (activeElement) {
          const sidebar = activeElement.closest("aside") as HTMLElement;
          if (sidebar) {
            const sidebarRect = sidebar.getBoundingClientRect();
            const elementRect = activeElement.getBoundingClientRect();

            // Check if element is outside the visible area of the sidebar
            const isAbove = elementRect.top < sidebarRect.top;
            const isBelow = elementRect.bottom > sidebarRect.bottom;

            // Only scroll the sidebar, not the main page
            if (isAbove || isBelow) {
              // Calculate scroll position using getBoundingClientRect for accuracy
              const sidebarScrollTop = sidebar.scrollTop;
              
              // Calculate the element's position relative to the sidebar's current scroll position
              const elementRelativeTop = elementRect.top - sidebarRect.top + sidebarScrollTop;
              const sidebarHeight = sidebar.clientHeight;
              const elementHeight = activeElement.clientHeight;
              
              // Center the element in the visible area
              const targetScroll = elementRelativeTop - sidebarHeight / 2 + elementHeight / 2;

              // Smoothly scroll the sidebar container, not the element itself
              // This prevents interfering with main page scroll
              sidebar.scrollTo({
                top: Math.max(0, targetScroll),
                behavior: "smooth",
              });
            }
          }
        }
      }
    }, 150); // Debounce to avoid too frequent updates

    return () => clearTimeout(timeoutId);
  }, [currentHeading]);

  // Define the ID for the "On This Page" heading.
  const onThisPageID = "on-this-page-heading";

  // Use the `useEffect` hook to set up an Intersection Observer for headings.
  useEffect(() => {
    // Define the callback for the Intersection Observer.

    const setCurrent: IntersectionObserverCallback = (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const { id } = entry.target;
          if (id === onThisPageID) continue;

          setCurrentHeading({
            slug: entry.target.id,
            text: entry.target.textContent || "",
          });
          break;
        }
      }
    };

    // Define options for the Intersection Observer.
    const observerOptions: IntersectionObserverInit = {
      // Negative top margin accounts for `scroll-margin`.
      // Negative bottom margin means heading needs to be towards top of viewport to trigger intersection.
      rootMargin: "-100px 0% -66%",
      threshold: 1,
    };

    // Create an Intersection Observer for headings.
    const headingsObserver = new IntersectionObserver(
      setCurrent,
      observerOptions,
    );

    // Observe all the headings in the main page content.
    document
      .querySelectorAll("article :is(h1,h2, h3)")
      .forEach((h) => headingsObserver.observe(h));

    // Stop observing when the component is unmounted.
    return () => headingsObserver.disconnect();
  }, []);

  // Function to handle link clicks and update the current heading.
  const onLinkClick = (e: any) => {
    setCurrentHeading({
      slug: e.currentTarget.getAttribute("href")!.replace("#", ""),
      text: e.currentTarget.textContent || "",
    });
  };

  // Component for rendering individual Table of Contents items.
  const TableOfContentsItem = ({ heading }: { heading: TocItem }) => {
    const { depth, slug, text, children } = heading;

    return (
      <li>
        <a
          className={` flex  items-center text-sm ${
            depth === 2 ? "" : "font-normal"
          } leading-[24px]  text-[#808080] hover:text-primary  depth-${depth} ${
            currentHeading.slug === slug && "text-primary"
          }`.trim()}
          href={`#${slug}`}
          onClick={onLinkClick}
        >
          {text}
        </a>
        {children.length > 0 ? (
          <ul className="ml-7 mt-3  space-y-3 text-sm ">
            {children.map((heading) => (
              <TableOfContentsItem key={heading.slug} heading={heading} />
            ))}
          </ul>
        ) : null}
      </li>
    );
  };

  return (
    <>
      <ul className="space-y-1 ">
        {toc.map((heading2) => (
          <TableOfContentsItem key={heading2.slug} heading={heading2} />
        ))}
      </ul>
    </>
  );
};

export default TableOfContents;
