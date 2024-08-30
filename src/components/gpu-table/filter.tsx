import React, { Fragment } from "react";
import { Menu, Transition, Popover, Disclosure } from "@headlessui/react";
import {
  ArchiveBoxIcon,
  ArrowRightCircleIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
  HeartIcon,
  PencilSquareIcon,
  TrashIcon,
  UserPlusIcon,
} from "@heroicons/react/20/solid";
import { clsx as classNames } from "clsx";
import CheckBox from "./checkbox";
import { modifyModel, type Gpus } from "./gpu-table";
import { onTop } from "../pricing-page/gpus/sort";

export const defaultFilters = {
  modal: [],
  ram: [],
  interface: [],
};

export interface Filters {
  modal: string[];
  ram: string[];
  interface: string[];
}

interface Options {
  name: string;
  value: "modal" | "ram" | "interface";
  options: { name: string; value: string }[];
}

export const availabilitySort = () => {};

export default function Filter({
  setFilteredData,
  res,
  filters,
  setFilters,
}: {
  setFilteredData: React.Dispatch<React.SetStateAction<Gpus["models"]>>;
  res?: Gpus;
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}) {
  const data: Options[] = [
    {
      name: "Chipset",
      value: "modal",
      options: [
        // { name: "H100", value: "h100" },
        // { name: "A100", value: "a100" },
        // { name: "A6000", value: "rtxa6000" },
      ],
    },
    {
      name: "vRAM",
      value: "ram",
      options: [
        // { name: "80Gi", value: "80Gi" },
        // { name: "40Gi", value: "40Gi" },
        // { name: "32Gi", value: "32Gi" },
        // { name: "24Gi", value: "24Gi" },
        // { name: "16Gi", value: "16Gi" },
        // { name: "8Gi", value: "8Gi" },
      ],
    },
    {
      name: "Interface",
      value: "interface",
      options: [
        // { name: "PCIe", value: "PCIe" },
        // { name: "SXM5", value: "SXM5" },
        // { name: "SXM4", value: "SXM4" },
        // { name: "SXM2", value: "SXM2" },
      ],
    },
  ];

  const [options, setOptions] = React.useState<Options[]>(data);

  React.useEffect(() => {
    const modal = onTop(res)?.map((model) => model.model);
    const ram = res?.models?.map((model) => model.ram);
    const interfaceTypes = res?.models?.map((model) => model.interface);

    setOptions((prev) => [
      {
        ...prev[0],
        options: [...new Set(modal)]?.map((modal) => ({
          name:
            modifyModel(modal).charAt(0).toUpperCase() +
            modifyModel(modal).slice(1),
          value: modal,
        })),
      },
      {
        ...prev[1],
        options: [...new Set(ram)]
          ?.map((ram) => ({ name: ram, value: ram }))
          ?.sort((a, b) => parseInt(b.name) - parseInt(a.name)),
      },
      {
        ...prev[2],
        options: [...new Set(interfaceTypes)]?.map((interfaceType) => ({
          name: interfaceType,
          value: interfaceType,
        })),
      },
    ]);
  }, [res]);

  console.log(options);

  React.useEffect(() => {
    if (
      filters.modal.length > 0 ||
      filters.ram.length > 0 ||
      filters.interface.length > 0
    ) {
      const filtered = res?.models
        ?.filter(
          (model) =>
            (filters.ram.includes(model.ram) || filters.ram.length === 0) &&
            (filters.modal.includes(model.model) ||
              filters.modal.length === 0) &&
            (filters.interface.includes(model.interface) ||
              filters.interface.length === 0),
        )
        .sort(
          (a, b) => b?.availability?.available - a?.availability?.available,
        );
      setFilteredData(filtered || []);
    } else {
      console.log("filtering");
      //h100 and a100 at top with same order as in onTop array
      setFilteredData(res?.models || []);
    }
  }, [filters, res]);

  return (
    <Popover as="div" className="relative inline-block text-left">
      <div>
        <Popover.Button className="inline-flex w-full items-center justify-center gap-x-1.5 rounded-md border bg-background2 px-3 py-1.5 text-sm font-medium text-textGray shadow-sm md:px-4 md:py-2">
          Filter
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M2.49967 5.83333V3.5C2.49967 2.94772 2.94739 2.5 3.49967 2.5H16.4998C17.052 2.5 17.4997 2.94766 17.4998 3.4999L17.5 5.83333M2.49967 5.83333L7.9838 10.534C8.20544 10.724 8.33301 11.0013 8.33301 11.2933V16.2192C8.33301 16.8698 8.9444 17.3472 9.57554 17.1894L10.9089 16.856C11.354 16.7447 11.6663 16.3448 11.6663 15.8859V11.2933C11.6663 11.0014 11.7939 10.724 12.0156 10.534L17.5 5.83333M2.49967 5.83333H17.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </Popover.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Popover.Panel className="absolute left-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-background2 px-4 py-3 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none md:left-auto md:right-0">
          {options?.map((item) => (
            <Disclosure
              as={"div"}
              className="flex flex-col gap-2 py-2"
              key={item.name}
              defaultOpen={filters?.[item.value]?.length > 0 ? true : false}
            >
              {({ open }) => (
                <>
                  <Disclosure.Button
                    className={
                      "group flex items-center gap-1.5  text-sm font-bold text-textGray "
                    }
                  >
                    <ChevronDownIcon
                      aria-hidden="true"
                      className={classNames(
                        open ? " rotate-0 transform" : "-rotate-90",
                        "h-4 w-4 transition-transform duration-200",
                      )}
                    />
                    {item.name}
                  </Disclosure.Button>
                  <Disclosure.Panel
                    className={"flex flex-col gap-2 py-2"}
                    as="div"
                  >
                    {item.options.map((option) => (
                      <div key={option.name}>
                        <CheckBox
                          label={option.name}
                          name={option.value}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters((prev) => ({
                                ...prev,
                                [item.value]: [
                                  ...prev[item.value],
                                  option.value,
                                ],
                              }));
                            } else {
                              setFilters((prev) => ({
                                ...prev,
                                [item.value]: prev[item.value].filter(
                                  (filter) => filter !== option.value,
                                ),
                              }));
                            }
                          }}
                          checked={filters?.[item.value]?.includes(
                            option.value,
                          )}
                        />
                      </div>
                    ))}
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          ))}

          <button
            onClick={() => setFilters(defaultFilters)}
            className="w-full pt-2 text-left text-sm font-medium text-cardGray "
          >
            Clear All
          </button>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}
