import { GHOST_PILL_CLASS } from "@/components/blog/blogUi";
import { cn } from "@/lib/utils";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";

import { Loader2, Search } from "lucide-react";

import Fuse from "fuse.js"; // Import the Fuse.js library

// Define a TypeScript interface for the project data
interface Blog {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  bannerImage: BannerImage;
  contributor: string;
  tag: string;
  readingTime?: number;
}

interface BannerImage {
  src: string;
}

// Trigger is a shadcn/ui outline Button; the dialog follows shadcn's
// CommandDialog (input row with a bottom border, then a scrolling list).
export default function SearchDialog() {
  // State variables
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [collectionData, setCollectionData] = useState<Blog[]>([]); // An array to store project data
  const [filteredBlogs, setFilteredProjects] = useState<Blog[]>([]); // Filtered projects based on the search input
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); // Error can be a string or null
  const [searchQuery, setSearchQuery] = useState<string>(""); // State for the search query

  // Fuse.js options for searching projectTitle and projectDescription
  const fuseOptions = {
    keys: ["title", "description"],
  };

  // Function to close the modal
  function closeModal() {
    setIsOpen(false);
  }

  // Function to open the modal
  function openModal() {
    setIsOpen(true);
  }

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(null); // Reset error state before fetching data

      // Fetch data when the dialog is open
      fetch(`/api/search/blog.json`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((jsonData) => {
          setCollectionData(jsonData as Blog[]); // Type assertion to Blog[]
          setFilteredProjects(jsonData.slice(0, 3)); // Initialize filteredBlogs with the first 3 projects
        })
        .catch((err) => {
          setError(err.message);
          console.error("Error fetching data:", err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen]);

  // Function to handle search input changes
  function handleSearchInput(event: React.ChangeEvent<HTMLInputElement>) {
    const query = event.target.value;
    setSearchQuery(query);

    // Use Fuse.js to filter projects based on the search query
    const fuse = new Fuse(collectionData, fuseOptions);
    const results = fuse.search(query);
    const filteredResults = results.map((result) => result.item);

    // Show all filtered projects when the search query is not empty
    setFilteredProjects(
      query === "" ? collectionData.slice(0, 3) : filteredResults,
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        aria-label="Search blog posts"
        className={cn(GHOST_PILL_CLASS, "w-8 px-0")}
      >
        <Search className="size-4" aria-hidden="true" />
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[50]" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-start justify-center p-4 pt-[12vh]">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl overflow-hidden rounded-xl border bg-background text-left text-foreground shadow-lg">
                  <Dialog.Title className="sr-only">
                    Search blog posts
                  </Dialog.Title>
                  <div className="flex h-12 items-center gap-2 border-b px-4">
                    <Search
                      className="size-4 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <input
                      className="h-full w-full bg-transparent text-base outline-none placeholder:text-muted-foreground sm:text-sm"
                      placeholder="Search blog posts..."
                      aria-label="Search blog posts"
                      value={searchQuery}
                      onChange={handleSearchInput}
                    />
                  </div>

                  {isLoading ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="size-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : error ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      Couldn&apos;t load posts: {error}
                    </p>
                  ) : isOpen ? (
                    <div className="max-h-[min(60vh,520px)] overflow-y-auto p-2">
                      {filteredBlogs.length === 0 ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">
                          No results found.
                        </p>
                      ) : (
                        <>
                          <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                            {searchQuery === "" ? "Latest posts" : "Results"}
                          </p>
                          {filteredBlogs.map((blog, index) => (
                            <BlocCard
                              key={index}
                              title={blog.title}
                              description={blog.description}
                              link={blog.link}
                              bannerImage={blog.bannerImage.src}
                              contributor={blog.contributor}
                              tag={blog.tag}
                              pubDate={blog.pubDate}
                              readingTime={blog.readingTime}
                            />
                          ))}
                        </>
                      )}
                    </div>
                  ) : null}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

const BlocCard = ({
  title,
  description,
  link,
  bannerImage,
  contributor,
  tag,
  pubDate,
  readingTime,
}: {
  title: string;
  description: string;
  link: string;
  bannerImage: string;
  contributor: string;
  tag: string;
  pubDate: string;
  readingTime?: number;
}) => {
  return (
    <a
      href={`/blog/${link}`}
      className="flex items-center gap-4 rounded-md p-2 outline-none transition-colors hover:bg-accent focus-visible:bg-accent"
    >
      <img
        width={600}
        height={338}
        src={bannerImage}
        alt=""
        loading="lazy"
        className="hidden aspect-video w-28 shrink-0 rounded-md border object-cover sm:block"
      />

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
          {tag && (
            <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full border border-transparent bg-neutral-100 px-2 py-0.5 font-medium text-neutral-900 dark:border-transparent dark:bg-neutral-800 dark:text-neutral-50">
              {tag}
            </span>
          )}
          <span className="truncate">
            {contributor} · {pubDate}
            {readingTime && ` · ${readingTime} min read`}
          </span>
        </div>

        <h3 className="mt-1.5 line-clamp-1 text-sm font-medium text-foreground">
          {title}
        </h3>

        <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </a>
  );
};
