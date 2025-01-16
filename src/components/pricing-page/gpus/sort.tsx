import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { clsx as classNames } from "clsx";
import { Fragment, useEffect, useState } from "react";
import type { Filters } from "./filter";
import type { Gpus } from "./gpu-table";
const publishingOptions = [
  { title: "Availability" },
  { title: "Lowest Price" },
  { title: "Highest Price" },
];

type ModelPriority = {
  model: string;
  ramPreference?: string[];
  interfacePreference?: string[];
};

export const onTop = (res?: Gpus): Gpus["models"] => {
  try {
    if (!res) {
      console.warn("Input is undefined, returning empty array");
      return [];
    }

    if (!Array.isArray(res.models)) {
      console.warn("No models array found in input, returning empty array");
      return [];
    }

    const validModels = res.models.filter(
      (model): model is Gpus["models"][0] => {
        if (!model) {
          console.warn("Encountered undefined model, filtering it out");
          return false;
        }

        if (typeof model.model !== "string") {
          console.warn(
            `Invalid model property for GPU: ${JSON.stringify(model)}`,
          );
          return false;
        }

        if (
          !model.availability ||
          typeof model.availability.available !== "number"
        ) {
          console.warn(
            `Invalid availability for GPU: ${JSON.stringify(model)}`,
          );
          return false;
        }

        return true;
      },
    );

    const modelPriorities: ModelPriority[] = [
      {
        model: "h200",
      },
      {
        model: "h100",
      },
      {
        model: "a100",
        ramPreference: ["80Gi"],
        interfacePreference: ["SXM4"],
      },
    ];

    const getPriorityScore = (
      gpu: Gpus["models"][0],
      modelConfig: ModelPriority,
    ): number => {
      try {
        let score = 0;

        if (modelConfig.ramPreference?.length && gpu.ram) {
          const ramIndex = modelConfig.ramPreference.indexOf(gpu.ram);
          score += (ramIndex === -1 ? 999 : ramIndex) * 1000;
        }

        if (modelConfig.interfacePreference?.length && gpu.interface) {
          const interfaceIndex = modelConfig.interfacePreference.indexOf(
            gpu.interface,
          );
          score += interfaceIndex === -1 ? 999 : interfaceIndex;
        }

        return score;
      } catch (error) {
        console.error("Error calculating priority score:", error);
        return 999999;
      }
    };

    const filtered = validModels
      .filter((model) =>
        modelPriorities.some((priority) => priority.model === model.model),
      )
      .sort((a, b) => {
        try {
          const aModelIndex = modelPriorities.findIndex(
            (p) => p.model === a.model,
          );
          const bModelIndex = modelPriorities.findIndex(
            (p) => p.model === b.model,
          );

          if (aModelIndex === -1 || bModelIndex === -1) {
            console.warn(
              `Model not found in priorities: ${a.model} or ${b.model}`,
            );
            return 0;
          }

          if (aModelIndex !== bModelIndex) {
            return aModelIndex - bModelIndex;
          }

          const modelConfig = modelPriorities[aModelIndex];

          if (!modelConfig.ramPreference && !modelConfig.interfacePreference) {
            return b.availability.available - a.availability.available;
          }

          const aScore = getPriorityScore(a, modelConfig);
          const bScore = getPriorityScore(b, modelConfig);

          return aScore - bScore;
        } catch (error) {
          console.error("Error during sort comparison:", error);
          return 0;
        }
      });

    const rest = validModels
      .filter(
        (model) =>
          !modelPriorities.some((priority) => priority.model === model.model),
      )
      .sort((a, b) => {
        try {
          return b.availability.available - a.availability.available;
        } catch (error) {
          console.error("Error sorting remaining models:", error);
          return 0;
        }
      });

    return [...filtered, ...rest];
  } catch (error) {
    console.error("Fatal error in onTop function:", error);
    return [];
  }
};

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
            : setFilteredData(onTop(res));
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
            <Listbox.Button className="inline-flex w-full items-center justify-center gap-x-1.5 rounded-md border bg-background2 px-3 py-1.5 text-sm font-medium text-textGray shadow-sm md:px-4 md:py-2">
              <span className="w-[4.2rem] truncate sm:w-full">
                {selected.title}
              </span>
              <ChevronDownIcon className="h-5 w-5 " aria-hidden="true" />
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute right-0 z-10 mt-2 w-44 origin-top-right divide-y divide-gray-100 rounded-md bg-background2 py-1 shadow-lg  ring-1 ring-black ring-opacity-5 focus:outline-none dark:divide-gray-800 md:left-auto md:right-0">
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
