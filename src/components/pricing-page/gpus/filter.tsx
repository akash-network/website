import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Check, X } from "lucide-react";
import React from "react";
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

export const availabilitySort = () => { };

export default function Filter({
  setFilteredData,
  res,
  filters,
  setFilters,
  isLoading,
  totalGpus,
  totalAvailableGpus,
}: {
  setFilteredData: React.Dispatch<React.SetStateAction<Gpus["models"]>>;
  res?: Gpus;
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  isLoading?: boolean;
  totalGpus?: number;
  totalAvailableGpus?: number;
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
      // Keep B200 and B300 at the top
      const b200Models = (filtered || []).filter(
        (model) => model?.model?.toLowerCase() === "b200",
      );
      const b300Models = (filtered || []).filter(
        (model) => model?.model?.toLowerCase() === "b300",
      );
      const otherModels = (filtered || []).filter((model) => {
        const modelLower = model?.model?.toLowerCase();
        return modelLower !== "b200" && modelLower !== "b300";
      });
      setFilteredData([...b200Models, ...b300Models, ...otherModels]);
    } else {
      // Keep B200 and B300 at the top even when no filters
      const allModels = res?.models || [];
      const b200Models = allModels.filter(
        (model) => model?.model?.toLowerCase() === "b200",
      );
      const b300Models = allModels.filter(
        (model) => model?.model?.toLowerCase() === "b300",
      );
      const otherModels = allModels.filter((model) => {
        const modelLower = model?.model?.toLowerCase();
        return modelLower !== "b200" && modelLower !== "b300";
      });
      setFilteredData([...b200Models, ...b300Models, ...otherModels]);
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
    <div className="flex flex-col gap-2 w-full">
      <div className="flex flex-col-reverse md:flex-row w-full   items-start md:items-center justify-between gap-4">
        {isLoading ? (
          <div className="h-9 w-[185px] rounded-full border  bg-transparent" />
        ) : (
          <div className="inline-flex items-center gap-1 rounded-full border bg-transparent px-[14px] py-1.5  text-sm md:text-[15px] font-normal text-para">
            GPU Utilization:
            {totalGpus && totalAvailableGpus && totalGpus > 0
              ? Math.round(((totalGpus - totalAvailableGpus) / totalGpus) * 100)
              : 0}
            %
          </div>
        )}
        <div className="flex  flex-col  w-full md:w-auto">
          <div className=" flex flex-wrap gap-2 md:gap-3">
            {options?.map((item) => (
              <div key={item.name} className="">
                <Select>
                  <SelectTrigger className="!rounded-md px-4 hover:bg-gray-50 dark:hover:bg-darkGray">
                    <p className="mr-2.5 text-sm font-medium text-foreground">
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
          <div className="md:hidden block">
            <ActiveFilters hasActiveFilters={hasActiveFilters} options={options} filters={filters} removeFilter={removeFilter} setFilters={setFilters} />
          </div>
        </div>
      </div>
      <div className="md:block hidden">
        <ActiveFilters hasActiveFilters={hasActiveFilters} options={options} filters={filters} removeFilter={removeFilter} setFilters={setFilters} />
      </div>
    </div>
  );
}


const ActiveFilters = ({ hasActiveFilters, options, filters, removeFilter, setFilters }: { hasActiveFilters: boolean, options: Options[], filters: Filters, removeFilter: (filterType: "modal" | "ram" | "interface", value: string) => void, setFilters: React.Dispatch<React.SetStateAction<Filters>> }) => {
  return hasActiveFilters && (
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
  )
}