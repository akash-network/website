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

export const availabilitySort = () => { };

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
    const modal = res?.models?.map((model) => model.model);
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
    <div className="rounded-md border px-5 py-4 shadow-sm w-full bg-white">
      <p className="pb-3 text-sm font-medium">Filtering Options</p>
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
    </div>
  );
}
