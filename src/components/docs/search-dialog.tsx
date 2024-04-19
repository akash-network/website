import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";

import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { Loader2 } from "lucide-react";

// Define a TypeScript interface for the project data
interface Docs {
  title: string;
  body: any;
  description?: string;
  slug: string;
}

export default function SearchDialog({ currentPath }: { currentPath: string }) {
  // State variables
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [collectionData, setCollectionData] = useState<Docs[]>([]); // An array to store project data
  const [filteredProjects, setFilteredProjects] = useState<Docs[]>([]); // Filtered projects based on the search input
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); // Error can be a string or null
  const [searchQuery, setSearchQuery] = useState<string>(""); // State for the search query
  console.log(filteredProjects);

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
      fetch(`/api/search/${currentPath.split("/")[1]}.json`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((jsonData) => {
          setCollectionData(jsonData as Docs[]); // Type assertion to Docs[]
          setFilteredProjects(jsonData.slice(0, 3)); // Initialize filteredProjects with the first 3 projects
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

    const lowerQuery = query.toLowerCase();

    // Filter projects based on the search query
    const filteredResults = collectionData.filter((item: Docs) =>
      item.title.toLowerCase().includes(lowerQuery) ||
      item.body.toLowerCase().includes(lowerQuery)
    )

    // Show all filtered projects when the search query is not empty
    setFilteredProjects(
      query === "" ? collectionData.slice(0, 3) : filteredResults,
    );
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        openModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <div
        onClick={openModal}
        className="flex cursor-pointer items-stretch justify-between gap-5 rounded border border-solid  bg-gray-50 bg-opacity-80 py-1.5 pl-3.5 pr-2 transition-transform duration-100 ease-in hover:translate-y-0.5 hover:transform  dark:bg-background2
        lg:w-[384px]"
      >
        <div className="flex items-center justify-between gap-2 text-cardGray dark:text-para">
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.25 14.25C11.5637 14.25 14.25 11.5637 14.25 8.25C14.25 4.93629 11.5637 2.25 8.25 2.25C4.93629 2.25 2.25 4.93629 2.25 8.25C2.25 11.5637 4.93629 14.25 8.25 14.25Z"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
            <path
              d="M15.7469 15.7508L12.4844 12.4883"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>

          <div className="grow whitespace-nowrap text-center text-sm leading-5 ">
            Search docs...
          </div>
        </div>
        <div className="flex items-center justify-between gap-1 rounded border border-solid  bg-gray-100 py-px pl-2  pr-2  dark:bg-background">
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/969e5b8d-6781-4fbb-a805-3e1404e74ab4?apiKey=2f02a73d37034e3f87e18c6bf22f47a0&"
            className="my-auto aspect-square w-3 max-w-full shrink-0 overflow-hidden object-contain object-center"
          />
          <div className="grow self-stretch whitespace-nowrap text-center text-xs leading-5 text-para">
            K
          </div>
        </div>
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-40" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-900/25 opacity-100 backdrop-blur transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-hidden">
            <div className="mt-10  flex  min-h-full items-start justify-center p-4 text-center md:mt-[96px]">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                {/* <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg    p-6 text-left align-middle  transition-all "> */}

                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg  border  border-[#808080] bg-background2 p-6 text-left align-middle shadow-lg transition-all ">
                  <input
                    className="focus:border-primary/40 w-full rounded-lg border px-4 py-2 outline-none dark:bg-background "
                    placeholder="Search documentation"
                    disabled={isLoading}
                    value={searchQuery}
                    onChange={handleSearchInput}
                  />

                  {isLoading ? (
                    <div className="mt-6 flex justify-center">
                      <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : error ? (
                    <div className="bg-primary/10 mt-6 rounded-lg px-6 py-4">
                      <h3 className="text-lg font-bold text-primary">
                        Something Bad Happened
                      </h3>
                      <p className="mt-1 line-clamp-4">{error}</p>
                    </div>
                  ) : isOpen ? (
                    <div className="mt-6 max-h-[420px] overflow-y-auto">
                      {filteredProjects.length === 0 ? (
                        <p className="flex items-center justify-center">
                          No results found
                        </p>
                      ) : (
                        filteredProjects.map((project, index) => (
                          <ProjectCard
                            key={index}
                            title={project.title}
                            link={project.slug}
                            query={searchQuery}
                            description={project.body}
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

const HighlightedText = ({ text, query }: any) => {
  const parts = text.split(new RegExp(`(${query})`, "gi"));
  console.log(parts);

  return (
    <>
      {parts.map((part: any, index: any) =>
        index % 2 === 0 ? (
          <span key={index}>{part}</span>
        ) : (
          <span key={index} className=" underline">
            {part}
          </span>
        ),
      )}
    </>
  );
};

const ProjectCard = ({
  title,
  link,
  query,
  description,
}: {
  title: string;
  link: string;

  query: string;
  description: string;
}) => {
  const highlighted = title.replace(
    new RegExp(`(${query})`, "gi"),
    (match) => `    <span className="bg-primary/40">${match}</span>`,
  );

  return (
    <a href={`/docs/${link}/`}>
      <div className="hover:bg-primary/10 flex cursor-pointer items-center justify-between rounded-lg p-4 text-[#808080] hover:text-primary md:px-6 md:py-4">
        <div className="w-[85%]">
          <h3 className="text-base font-bold  md:text-lg">
            <HighlightedText text={title} query={query} />
          </h3>
          {/* <h3 className="text-base font-bold  md:text-lg">{title}</h3> */}
          {/* show only one line of description where the query is found */}

          <p className="mt-1 line-clamp-1">{description}</p>
        </div>
        <div>
          <ChevronRightIcon className="h-5 w-5 md:h-8 md:w-8 " />
        </div>
      </div>
    </a>
  );
};

const SearchIcon = () => {
  return (
    <>
      <div className="hidden md:block">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15.498 15.5L18.998 19"
            stroke="#272540"
            strokeWidth="1.17434"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
          <path
            d="M5 11C5 14.3137 7.68629 17 11 17C12.6597 17 14.1621 16.3261 15.2483 15.237C16.3308 14.1517 17 12.654 17 11C17 7.68629 14.3137 5 11 5C7.68629 5 5 7.68629 5 11Z"
            stroke="#272540"
            strokeWidth="1.17434"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
      </div>

      <div className="block md:hidden">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10.334 10.333L12.6673 12.6663"
            stroke="#272540"
            strokeWidth="1.17434"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
          <path
            d="M3.33398 7.33301C3.33398 9.54215 5.12485 11.333 7.33398 11.333C8.44047 11.333 9.44202 10.8837 10.1662 10.1577C10.8878 9.43411 11.334 8.43566 11.334 7.33301C11.334 5.12387 9.54312 3.33301 7.33398 3.33301C5.12485 3.33301 3.33398 5.12387 3.33398 7.33301Z"
            stroke="#272540"
            strokeWidth="1.17434"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
      </div>
    </>
  );
};
