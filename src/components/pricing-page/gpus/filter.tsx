import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Check, X } from "lucide-react";
import React from "react";
import SpeakToExpert from "../SpeakToExpert";
import { modifyModel, type Gpus } from "./gpu-table";
import { onTop } from "./sort";

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
      options: [],
    },
    {
      name: "vRAM",
      value: "ram",
      options: [],
    },
    {
      name: "Interface",
      value: "interface",
      options: [],
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
      setFilteredData(res?.models || []);
    }
  }, [filters, res]);

  const handleSelectOption = (item: Options, optionValue: string) => {
    if (filters[item.value].includes(optionValue)) {
      // If already selected, remove it
      setFilters((prev) => ({
        ...prev,
        [item.value]: prev[item.value].filter(
          (filter) => filter !== optionValue,
        ),
      }));
    } else {
      // If not selected, add it
      setFilters((prev) => ({
        ...prev,
        [item.value]: [...prev[item.value], optionValue],
      }));
    }
  };

  const removeFilter = (
    filterType: "modal" | "ram" | "interface",
    value: string,
  ) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: prev[filterType].filter((filter) => filter !== value),
    }));
  };

  const hasActiveFilters =
    filters.modal.length > 0 ||
    filters.ram.length > 0 ||
    filters.interface.length > 0;

  return (
    <div className="flex w-full flex-col ">
      <div className="flex items-center justify-between border-b  pb-5">
        <div className=" flex flex-1 flex-wrap gap-4">
          {options?.map((item) => (
            <div key={item.name} className="">
              <Select>
                <SelectTrigger className="px-4">
                  <p className="text-s2 mr-2.5 font-medium text-foreground">
                    {item.name}
                  </p>
                </SelectTrigger>
                <SelectContent>
                  {item.options.map((option) => {
                    const isSelected = filters[item.value].includes(
                      option.value,
                    );
                    return (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        hideCheck={true}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectOption(item, option.value);
                        }}
                        className="flex cursor-pointer items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          {isSelected && (
                            <span className="absolute left-2 flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                              <Check className="h-4 w-4 text-primary" />
                            </span>
                          )}
                          <span>{option.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
        <SpeakToExpert className="!py-[7px] px-4" />
      </div>

      {/* Combined badges area */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 border-b  py-3">
          <div className="mr-2 text-sm font-medium">Active filters:</div>
          {options.map((item) =>
            filters[item.value].map((filterValue) => {
              const optionName =
                item.options.find((o) => o.value === filterValue)?.name ||
                filterValue;
              return (
                <div
                  key={`${item.value}-${filterValue}`}
                  className="inline-flex items-center rounded-full border border-darkGrayBorder bg-lightGray px-3 py-1 text-xs dark:border-defaultBorder dark:bg-background2"
                >
                  <span className="mr-1 font-medium text-darkGrayText dark:text-para">
                    {item.name}:
                  </span>
                  <span className="font-semibold text-foreground">
                    {optionName}
                  </span>
                  <button
                    onClick={() => removeFilter(item.value, filterValue)}
                    className="ml-1 text-textGray  hover:text-primary"
                  >
                    <X className="h-3 w-3 " />
                  </button>
                </div>
              );
            }),
          )}
          {hasActiveFilters && (
            <button
              onClick={() => setFilters(defaultFilters)}
              className="ml-auto text-xs  hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
