import GpuTable from "@/components/pricing-page/gpus/gpu-table";
import ProviderTable from "@/components/pricing-page/provider/provider-table";
import UsageTable from "@/components/pricing-page/usage/usage-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/radix-tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState } from "react";

const tabs = [
    {
        value: 'gpus',
        description: 'GPU Pricing',
    },
    {
        value: 'usage',
        description: 'Usage Pricing Calculator',
    },
    {
        value: 'provider',
        description: 'Provider Earn Calculator',
    },
]

function Pricing() {
    const [value, setValue] = useState<string>(tabs[0].value);
    const handleTabChange = (value: string) => {
        setValue(value);
    }
    return (
        <Tabs defaultValue={tabs[0].value} className="w-full" onValueChange={handleTabChange} value={value}>
            <div className="flex md:hidden justify-center w-full">
                <Select defaultValue={tabs[0].value} onValueChange={handleTabChange}>
                    <SelectTrigger className="w-full max-w-sm">
                        <SelectValue placeholder={tabs[0].description} />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                        {tabs.map((item) => {
                            return <SelectItem value={item.value}>{item.description}</SelectItem>
                        })}
                    </SelectContent>
                </Select>
            </div>
            <div className="hidden md:flex justify-center w-full">
                <TabsList className="bg-secondary-gray dark:bg-darkGray">
                    {tabs.map((item) => {
                        return <TabsTrigger value={item.value}>{item.description}</TabsTrigger>
                    })}
                </TabsList>
            </div>
            <TabsContent value="gpus">
                <div className="my-8 md:m-[4.5rem]">
                    <h2 className="text-center text-2xl font-medium md:block md:text-3xl">
                        GPU Models, Prices & Availabilty
                    </h2>
                    <p className="text-center mt-3 leading-normal hidden md:block">
                        Browse the list of available GPUs along with their hourly rates.
                    </p>
                    <p className="text-center mt-3 leading-normal md:hidden">
                        Browse the list of available GPUs along<br />with their hourly rates.
                    </p>
                </div>
                <GpuTable initialData={null} />
            </TabsContent>
            <TabsContent value="usage">
                <div className="my-8 md:m-[4.5rem]">
                    <h2 className="text-center text-2xl font-medium md:block md:text-3xl">
                        Usage Pricing
                    </h2>
                    <p className="text-center hidden md:block mt-3">
                        Estimate your costs by selecting the resources you need. <br />
                        Adjust CPU, memory, storage, and other parameters to get a detailed
                        cost breakdown.
                    </p>
                    <p className="text-center md:hidden mt-3 leading-normal">
                        Estimate your costs by selecting the resources you need. Adjust CPU, memory, storage, and other parameters to get a detailed cost breakdown.
                    </p>
                </div>
                <UsageTable initialData={null} />
            </TabsContent>
            <TabsContent value="provider">
                <div className="my-8 md:m-[4.5rem]">
                    <h2 className="text-center text-2xl font-medium hidden md:block md:text-3xl">
                        Provider Earn Calculator
                    </h2>
                    <h2 className="text-center text-2xl font-bold md:hidden">
                        Provider Earnings
                    </h2>
                    <p className="text-center mt-3 leading-normal">
                        Calculate your potential earnings by<br />providing resources to the Akash Network.
                    </p>
                </div>
                <ProviderTable initialData={null} />
            </TabsContent>
        </Tabs>
    )
}

export { Pricing };
