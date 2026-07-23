import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Fuse from "fuse.js";

interface BitsPost {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  bannerImage: { src: string } | null;
  author: string;
  tag: string;
}

const fuseOptions = {
  keys: ["title", "description"],
};

export default function BitsSearchDialog() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [collectionData, setCollectionData] = useState<BitsPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BitsPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(null);

      fetch(`/api/search/bits.json`)
        .then((response) => {
          if (!response.ok) throw new Error("Network response was not ok");
          return response.json();
        })
        .then((jsonData) => {
          setCollectionData(jsonData as BitsPost[]);
          setFilteredPosts(jsonData.slice(0, 3));
        })
        .catch((err) => {
          setError(err.message);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen]);

  function handleSearchInput(event: React.ChangeEvent<HTMLInputElement>) {
    const query = event.target.value;
    setSearchQuery(query);
    const fuse = new Fuse(collectionData, fuseOptions);
    const results = fuse.search(query);
    setFilteredPosts(
      query === ""
        ? collectionData.slice(0, 3)
        : results.map((r) => r.item),
    );
  }

  return (
    <>
      <button
        onClick={openModal}
        className="inline-flex items-center justify-center gap-x-1.5 rounded-md border border-border bg-background2 px-3.5 py-2.5 text-sm font-medium leading-none text-sortText shadow-sm hover:bg-gray-50 hover:dark:bg-background"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-textGray"
          stroke="currentColor"
        >
          <path
            d="M12.9141 12.9167L15.8307 15.8334"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4.16406 9.16675C4.16406 11.9282 6.40264 14.1667 9.16406 14.1667C10.5472 14.1667 11.7991 13.6052 12.7043 12.6976C13.6064 11.7931 14.1641 10.5451 14.1641 9.16675C14.1641 6.40532 11.9255 4.16675 9.16406 4.16675C6.40264 4.16675 4.16406 6.40532 4.16406 9.16675Z"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Search
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 z-[50] bg-slate-900/25 opacity-100 backdrop-blur transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-[51] overflow-y-hidden">
            <div className="mt-10 flex min-h-full items-start justify-center p-4 text-center md:mt-[96px]">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg p-6 text-left align-middle transition-all">
                  <div className="relative">
                    <input
                      className="block w-full rounded-lg border bg-background2 py-3 pl-4 pr-12 text-base text-textGray placeholder:text-para focus:outline-none sm:text-sm sm:leading-6"
                      placeholder="Search Bits..."
                      value={searchQuery}
                      onChange={handleSearchInput}
                    />
                    <svg
                      className="pointer-events-none absolute right-4 top-3 h-6 w-6 fill-textGray"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M20.47 21.53a.75.75 0 1 0 1.06-1.06l-1.06 1.06Zm-9.97-4.28a6.75 6.75 0 0 1-6.75-6.75h-1.5a8.25 8.25 0 0 0 8.25 8.25v-1.5ZM3.75 10.5a6.75 6.75 0 0 1 6.75-6.75v-1.5a8.25 8.25 0 0 0-8.25 8.25h1.5Zm6.75-6.75a6.75 6.75 0 0 1 6.75 6.75h1.5a8.25 8.25 0 0 0-8.25-8.25v1.5Zm11.03 16.72-5.196-5.197-1.061 1.06 5.197 5.197 1.06-1.06Zm-4.28-9.97c0 1.864-.755 3.55-1.977 4.773l1.06 1.06A8.226 8.226 0 0 0 18.75 10.5h-1.5Zm-1.977 4.773A6.727 6.727 0 0 1 10.5 17.25v1.5a8.226 8.226 0 0 0 5.834-2.416l-1.061-1.061Z"></path>
                    </svg>
                  </div>

                  {isLoading ? (
                    <div className="mt-6 flex justify-center">
                      <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : error ? (
                    <div className="mt-6 rounded-lg bg-primary/10 px-6 py-4">
                      <h3 className="text-lg font-bold text-primary">
                        Something went wrong
                      </h3>
                      <p className="mt-1 line-clamp-4">{error}</p>
                    </div>
                  ) : isOpen ? (
                    <div className="mt-6 flex max-h-[450px] flex-col gap-y-5 overflow-y-auto lg:max-h-[600px]">
                      {filteredPosts.length === 0 ? (
                        <p className="flex items-center justify-center">
                          No results found
                        </p>
                      ) : (
                        filteredPosts.map((post, index) => (
                          <BitsCard
                            key={index}
                            title={post.title}
                            description={post.description}
                            link={post.link}
                            bannerImage={post.bannerImage?.src ?? null}
                            author={post.author}
                            tag={post.tag}
                            pubDate={post.pubDate}
                          />
                        ))
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

const BitsCard = ({
  title,
  description,
  link,
  bannerImage,
  author,
  tag,
  pubDate,
}: {
  title: string;
  description: string;
  link: string;
  bannerImage: string | null;
  author: string;
  tag: string;
  pubDate: string;
}) => {
  return (
    <a href={`/bits/${link}`}>
      <div className="border-md flex w-full">
        {bannerImage && (
          <div className="hidden max-w-[180px] flex-shrink-0 overflow-hidden rounded-l-[8px] sm:flex md:max-w-[257px]">
            <img
              width={600}
              height={600}
              src={bannerImage}
              className="aspect-video h-full object-cover"
            />
          </div>
        )}

        <div className="w-full items-center rounded-l-[8px] rounded-r-[8px] bg-background2 px-4 py-4 sm:rounded-l-none sm:px-2 md:px-6 md:py-6">
          <div className="flex items-center gap-x-2">
            <p className="text-[8px] font-medium leading-none text-cardGray">
              by {author}
            </p>
            {tag && (
              <p className="rounded-full bg-[#E6E8EB] px-2 text-[8px] font-medium text-cardGray">
                {tag}
              </p>
            )}
          </div>

          <h3 className="mt-2 text-[10px] font-bold md:text-xs">{title}</h3>

          <div className="sm:hidden md:block">
            <p className="mt-2 line-clamp-2 text-[10px]">{description}</p>
          </div>

          <p className="mt-2 inline-flex items-center text-[8px] font-medium text-cardGray">
            5 Min Read
            <span className="mx-1 block h-0.5 w-0.5 rounded-full bg-para" />
            <span className="text-[8px] text-cardGray">{pubDate}</span>
          </p>
        </div>
      </div>
    </a>
  );
};
