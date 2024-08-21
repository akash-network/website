import { Fragment, useEffect, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { clsx as classNames } from "clsx";
import type { Gpus } from "./gpu-table";
import type { Filters } from "./filter";
const publishingOptions = [
  { title: "Availability" },
  { title: "Lowest Price" },
  { title: "Highest Price" },
];

export default function Sort({
  setFilteredData,
  res,
  filters,
}: {
  setFilteredData: React.Dispatch<React.SetStateAction<Gpus["models"]>>;
  res?: Gpus;
  filters: Filters;
}) {
  const [selected, setSelected] = useState(publishingOptions[0]);

  const onTop = () => {
    const onTop = ["h100", "a100"];
    const filtered = res?.models
      ?.filter((model) => onTop?.includes(model?.model))
      .sort((a, b) => onTop.indexOf(a?.model) - onTop.indexOf(b?.model));
    const rest = res?.models
      ?.filter((model) => !onTop?.includes(model.model))
      .sort((a, b) => b?.availability?.available - a?.availability?.available);

    return [...(filtered ?? []), ...(rest ?? [])]?.filter(
      (model) => model !== undefined,
    );
  };

  useEffect(() => {
    const sortData = (sortType: string) => {
      switch (sortType) {
        case "Availability":
          filters.modal.length > 0 ||
            filters.ram.length > 0 ||
            filters.interface.length > 0
            ? setFilteredData((prev) =>
              [...prev].sort(
                (a, b) => b.availability.available - a.availability.available,
              ),
            )
            : setFilteredData(onTop());
          break;
        case "Lowest Price":
          setFilteredData((prev) =>
            [...prev].sort((a, b) => {
              const aMed = a.price ? a.price.med : 0;
              const bMed = b.price ? b.price.med : 0;
              return aMed - bMed;
            }),
          );

          break;
        case "Highest Price":
          setFilteredData((prev) =>
            [...prev].sort((a, b) => {
              const aMed = a.price ? a.price.med : 0;
              const bMed = b.price ? b.price.med : 0;
              return bMed - aMed;
            }),
          );
          break;
        default:
          break;
      }
    };
    sortData(selected.title);
  }, [selected, res?.models, setFilteredData, filters]);

  return (
    <Listbox value={selected} onChange={setSelected}>
      {({ open }) => (
        <>
          <div className="relative">
            <Listbox.Button className="inline-flex w-full items-center justify-center gap-x-1.5 rounded-md border bg-background2 px-4 py-2 text-sm font-medium text-textGray shadow-sm">
              {selected.title}
              <ChevronDownIcon className="h-5 w-5 " aria-hidden="true" />
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute left-0 z-10 mt-2 w-44 origin-top-right divide-y divide-gray-100 rounded-md bg-background2 py-1 shadow-lg  ring-1 ring-black ring-opacity-5 focus:outline-none dark:divide-gray-800 md:left-auto md:right-0">
                {publishingOptions.map((option) => (
                  <Listbox.Option
                    key={option.title}
                    className={({ active }) =>
                      classNames(
                        active ? "bg-primary text-white" : "text-textGray",
                        "relative cursor-default select-none py-2 pl-8 pr-4",
                      )
                    }
                    value={option}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={classNames(
                            "block truncate text-sm font-medium ",
                          )}
                        >
                          {option.title}
                        </span>

                        {selected ? (
                          <span
                            className={classNames(
                              active ? "text-white" : "text-primary",
                              "absolute inset-y-0 left-0 flex items-center pl-1.5",
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
}
