import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";

import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { Loader2 } from "lucide-react";

import Fuse from "fuse.js"; // Import the Fuse.js library

// Define a TypeScript interface for the project data
interface Project {
  title: string;
  pubDate: string;
  tags: string[];
  link: string;
}

export default function SearchDialog({ currentPath }: { currentPath: string }) {
  // State variables
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [collectionData, setCollectionData] = useState<Project[]>([]); // An array to store project data
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]); // Filtered projects based on the search input
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); // Error can be a string or null
  const [searchQuery, setSearchQuery] = useState<string>(""); // State for the search query

  // Fuse.js options for searching projectTitle and projectDescription
  const fuseOptions = {
    keys: ["title"],
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
      fetch(`/api/search/${currentPath.split("/")[2]}.json`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((jsonData) => {
          setCollectionData(jsonData as Project[]); // Type assertion to Project[]
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
      <div
        onClick={openModal}
        className="inline-flex h-8 w-[203px] cursor-pointer items-center justify-between rounded-lg border border-[#808080] bg-white p-2 text-center text-xs leading-[18px] text-foreground transition-transform duration-100 ease-in hover:-translate-y-0.5 hover:transform
        "
      >
        <SearchIcon />
        Search
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-[#FBF8F7] opacity-80 blur-3xl" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-hidden">
            <div className="mt-12  flex  min-h-full items-start justify-center p-4 text-center md:mt-28">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg  border  border-[#808080] bg-white p-6 text-left align-middle shadow-lg transition-all ">
                  <input
                    className="w-full rounded-lg border px-4 py-2 outline-none focus:border-primary/40 "
                    placeholder="Search for projects"
                    value={searchQuery}
                    onChange={handleSearchInput}
                  />

                  {isLoading ? (
                    <div className="mt-6 flex justify-center">
                      <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : error ? (
                    <div className="mt-6 rounded-lg bg-primary/10 px-6 py-4">
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
                            link={project.link}
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

const ProjectCard = ({ title, link }: { title: string; link: string }) => {
  return (
    <a href={link}>
      <div className="flex cursor-pointer items-center justify-between rounded-lg p-4 text-[#808080] hover:bg-primary/10 hover:text-primary md:px-6 md:py-4">
        <div className="w-[85%]">
          <h3 className="text-base font-bold  md:text-lg">{title}</h3>
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
