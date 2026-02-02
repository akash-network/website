import GpuTable from "@/components/pricing-page/gpus/gpu-table";
import ProviderTable from "@/components/pricing-page/provider/provider-table";
import UsageTable from "@/components/pricing-page/usage/usage-table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/radix-tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useState } from "react";

const tabs = [
  {
    value: "gpus",
    description: "GPU Pricing",
  },
  {
    value: "usage",
    description: "Usage Pricing Calculator",
  },
  {
    value: "provider",
    description: "Provider Earn Calculator",
  },
];

function Pricing() {
  const [value, setValue] = useState<string>(tabs[0].value);
  const handleTabChange = (value: string) => {
    setValue(value);
  };
  return (
    <Tabs
      defaultValue={tabs[0].value}
      className="w-full"
      onValueChange={handleTabChange}
      value={value}
    >
      <div className="flex w-full justify-center md:hidden">
        <Select defaultValue={tabs[0].value} onValueChange={handleTabChange}>
          <SelectTrigger className="w-full max-w-sm">
            <SelectValue placeholder={tabs[0].description} />
          </SelectTrigger>
          <SelectContent className="group bg-background2">
            {tabs.map((item) => {
              return (
                <SelectItem
                  key={item.value}
                  value={item.value}
                  className={cn(
                    "data-[state=checked]:bg-primary",
                    "data-[state=checked]:text-white",
                    "group/item hover:bg-primary hover:text-white",
                  )}
                >
                  {item.description}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
      <div className="hidden w-full justify-center md:flex">
        <TabsList className="bg-secondary-gray dark:bg-darkGray">
          {tabs.map((item) => {
            return (
              <TabsTrigger value={item.value}>{item.description}</TabsTrigger>
            );
          })}
        </TabsList>
      </div>
      <TabsContent value="gpus">
        <div className="my-8 md:m-[4.5rem]">
          <h2 className="text-center text-2xl font-medium md:block md:text-3xl">
            GPU Pricing and Availability
          </h2>
          <p className="mt-3 hidden text-center leading-normal md:block">
            Browse the list of available GPUs along with their hourly rates.
          </p>
          <p className="mt-3 text-center leading-normal md:hidden">
            Browse the list of available GPUs along
            <br />
            with their hourly rates.
          </p>
        </div>
        <GpuTable initialData={undefined} />
      </TabsContent>
      <TabsContent value="usage">
        <div className="my-8 md:m-[4.5rem]">
          <h2 className="text-center text-2xl font-medium md:block md:text-3xl">
            Usage Pricing
          </h2>
          <p className="mt-3 hidden text-center md:block">
            Estimate your costs by selecting the resources you need. <br />
            Adjust CPU, memory, storage, and other parameters to get a detailed
            cost breakdown.
          </p>
          <p className="mt-3 text-center leading-normal md:hidden">
            Estimate your costs by selecting the resources you need. Adjust CPU,
            memory, storage, and other parameters to get a detailed cost
            breakdown.
          </p>
        </div>
        <UsageTable initialData={undefined} />
      </TabsContent>
      <TabsContent value="provider">
        <div className="my-8 md:m-[4.5rem]">
          <h2 className="hidden text-center text-2xl font-medium md:block md:text-3xl">
            Provider Earn Calculator
          </h2>
          <h2 className="text-center text-2xl font-bold md:hidden">
            Provider Earnings
          </h2>
          <p className="mt-3 hidden text-center leading-normal md:block">
            Calculate your potential earnings by providing resources to the
            Akash Network.
          </p>
          <p className="mt-3 text-center leading-normal md:hidden">
            Calculate your potential earnings by
            <br />
            providing resources to the Akash Network.
          </p>
        </div>
        <ProviderTable initialData={undefined} />
      </TabsContent>
    </Tabs>
  );
}

export { Pricing };
