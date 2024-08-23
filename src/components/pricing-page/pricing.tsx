import GpuTable from "@/components/pricing-page/gpus/gpu-table";
import ProviderTable from "@/components/pricing-page/provider/provider-table";
import UsageTable from "@/components/pricing-page/usage/usage-table";
import TabsWraaper, { TabContent, TabList, TabTrigger } from "@/components/ui/tabs"

function Pricing() {
    return (
        <TabsWraaper defaultValue={"gpus"} className="w-full">
            <div className="flex justify-center w-full">
                <TabList className="bg-secondary-gray dark:bg-darkGray">
                    <TabTrigger value="gpus">GPU Pricing</TabTrigger>
                    <TabTrigger value="usage">Usage Pricing Calculator</TabTrigger>
                    <TabTrigger value="provider">Provider Earn Calculator</TabTrigger>
                </TabList>
            </div>
            <TabContent value="gpus">
                <div className="m-12">
                    <h2 className="text-center text-2xl font-bold md:block md:text-3xl">
                        GPU Models, Prices & Availabilty
                    </h2>
                    <p className="text-center leading-[28px]">
                        Browse the list of available GPUs along with their hourly rates.
                    </p>
                </div>
                <GpuTable initialData={null} />
            </TabContent>
            <TabContent value="usage">
                <div className="m-12">
                    <h2 className="text-center text-2xl font-bold md:block md:text-3xl">
                        Usage Pricing
                    </h2>
                    <p className="text-center leading-[28px]">
                        Estimate your costs by selecting the resources you need. <br />
                        Adjust CPU, memory, storage, and other parameters to get a detailed
                        cost breakdown.
                    </p>
                </div>
                <UsageTable initialData={null} />
            </TabContent>
            <TabContent value="provider">
                <div className="m-12">
                    <h2 className="text-center text-2xl font-bold md:block md:text-3xl">
                        Provider Earn Calculator
                    </h2>
                    <p className="text-center leading-[28px]">
                        Calculate your potential earnings by providing resources to the Akash Network.
                    </p>
                </div>
                <ProviderTable initialData={null} />
            </TabContent>
        </TabsWraaper>
    )
}

export { Pricing };
