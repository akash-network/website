import {
    QueryClient,
    QueryClientProvider,
    useQuery,
} from "@tanstack/react-query";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { gpus } from "@/utils/api";
import clsx from "clsx";
import MonthEarning from "./month-earning";
import _ from 'lodash'
import arrowUpRight from '../../../assets/icons/arrow-up-right.svg';
import PricingUnit from "./pricing-unit";
import CpuBrand from '../../../assets/cpu-brand.svg'
import MemoryBrand from '../../../assets/memory-brand.svg'
import StorageBrand from '../../../assets/storage-brand.svg'
import GpuBrand from '../../../assets/gpu-brand.svg'
import IpsBrand from '../../../assets/ips-brand.svg'
import EndpointBrand from '../../../assets/endpoint-brand.svg'

export interface Gpus {
    availability: { total: number; available: number };
    models: Array<{
        vendor: string;
        model: string;
        ram: string;
        interface: string;
        availability: { total: number; available: number };
        providerAvailability: { total: number; available: number };
        price: {
            min: number;
            max: number;
            avg: number;
            med: number;
            weightedAverage: number;
        };
    }>;
    time?: number;
}

const ProviderTable = ({
    initialData,
    pathName,
    subCom,
}: {
    initialData?: any;
    pathName?: any;
    subCom?: boolean;
}) => {
    const queryClient = new QueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <Table
                initialData={{
                    data: initialData,
                }}
                pathName={pathName}
                subCom={subCom}
            />
        </QueryClientProvider>
    );
};

export default ProviderTable;

const Table = ({
    initialData,
    pathName,
    subCom,
}: {
    initialData?: {
        data: any;
    };
    pathName?: any;
    subCom?: boolean;
}) => {
    const fetchInterval = 1000 * 60;

    const {
        data: result,
        isLoading,
        isFetching,
        isInitialLoading,
    } = useQuery<
        {
            data: Gpus;
        },
        Error
    >({
        queryKey: ["GPU_TABLE"],
        queryFn: () => axios.get(gpus),
        refetchIntervalInBackground: true,

        refetchInterval: fetchInterval,
    });

    const data = result?.data;
    return (
        <Tables
            data={data}
            subCom={subCom}
            pathName={pathName}
            isLoading={isLoading || isInitialLoading}
        />
    );
};

export const Tables = ({
    data,
    pathName,
    subCom,
    isLoading,
}: {
    data?: Gpus;
    pathName?: any;
    subCom?: boolean;
    isLoading?: boolean;
}) => {
    const max = {
        leasePercentInput: 100,
        cpuInput: 100,
        cpuPricing: 100,
        memoryInput: 512,
        memoryPricing: 100,
        storageInput: 10240,
        storagePricing: 100,
        persistentStorageInput: 10240,
        persistentStoragePricing: 100,
        gpuInput: 100,
        gpuPricing: 100,
        ipInput: 100,
        ipPricing: 100,
        endpointInput: 100,
        endpointPricing: 100,
    }

    const [leasePercentInput, setLeasePercentInput] = useState(100)
    const [cpuInput, setCpuInput] = useState(10)
    const [cpuPricing, setCpuPricing] = useState(10)
    const [memoryInput, setMemoryInput] = useState(256)
    const [memoryPricing, setMemoryPricing] = useState(10)
    const [storageInput, setStorageInput] = useState(1024)
    const [storagePricing, setStoragePricing] = useState(10)
    const [persistentStorageInput, setPersistentStorageInput] = useState(1024)
    const [persistentStoragePricing, setPersistentStoragePricing] = useState(10)
    const [gpuInput, setGPUInput] = useState(1)
    const [gpuPricing, setGPUPricing] = useState(1)
    const [ipInput, setIpInput] = useState(1)
    const [ipPricing, setIpPricing] = useState(1)
    const [endpointInput, setEndpointInput] = useState(1)
    const [endpointPricing, setEndpointPricing] = useState(1)

    const [aktAverage, setAktAverage] = useState(true)
    const [usdPrice, setUsdPrice] = useState(0)
    const [monthlyAverage, setMonthlyAverage] = useState(0)

    const [usdPrices, setUsdPrices] = useState({
        cpuTotalPrice: 0,
        memoryTotalPrice: 0,
        storageTotalPrice: 0,
        persistenStorageTotalPrice: 0,
        gpuTotalPrice: 0,
        ipTotalPrice: 0,
        endpointTotalPrice: 0,
        totalPrice: 0,
    })


    useEffect(() => {
        let currentPrice = 0.0
        let averagePrice = 0.0
        fetch('https://api.coingecko.com/api/v3/coins/akash-network/tickers')
            .then((response) => response.json())
            .then((data) => {
                for (let i = 0; i < data.tickers.length; i += 1) {
                    if (data.tickers[i].market.name === 'Coinbase Exchange') {
                        currentPrice = data.tickers[i].converted_last.usd
                        setUsdPrice(data.tickers[i].converted_last.usd)
                        break
                    }
                }
            })
        fetch(
            'https://api.coingecko.com/api/v3/coins/akash-network/market_chart?vs_currency=usd&days=30&interval=daily',
        )
            .then((response) => response.json())
            .then((data) => {
                const mean = _.meanBy(data.prices, (o: [number, number]) => {
                    return o[1]
                })
                averagePrice = mean
                if (currentPrice > averagePrice) {
                    setAktAverage(false)
                }
                setMonthlyAverage(mean)
            })
    }, [])

    useEffect(() => {
        const cpuTotalPrice = (cpuInput * cpuPricing) / (100 / leasePercentInput)
        const memoryTotalPrice = (memoryInput * memoryPricing) / (100 / leasePercentInput)
        const storageTotalPrice = (storageInput * storagePricing) / (100 / leasePercentInput)
        const persistenStorageTotalPrice = (persistentStorageInput * persistentStoragePricing) / (100 / leasePercentInput)
        const gpuTotalPrice = (gpuPricing * gpuInput) / (100 / leasePercentInput)
        const ipTotalPrice = (ipPricing * ipInput) / (100 / leasePercentInput)
        const endpointTotalPrice = (endpointInput * endpointPricing) / (100 / leasePercentInput)

        const totalPrice =
            cpuTotalPrice +
            memoryTotalPrice +
            storageTotalPrice +
            persistenStorageTotalPrice +
            gpuTotalPrice +
            ipTotalPrice +
            endpointTotalPrice

        setUsdPrices({
            cpuTotalPrice,
            memoryTotalPrice,
            storageTotalPrice,
            persistenStorageTotalPrice,
            gpuTotalPrice,
            ipTotalPrice,
            endpointTotalPrice,
            totalPrice,
        })
    }, [cpuInput,
        cpuPricing,
        memoryInput,
        memoryPricing,
        storageInput,
        storagePricing,
        persistentStorageInput,
        persistentStoragePricing,
        gpuInput,
        gpuPricing,
        ipInput,
        ipPricing,
        endpointInput,
        endpointPricing,
    ])

    const calculateAKTPrice = (usdValue: any) => {
        return (aktAverage ? usdValue / monthlyAverage : usdValue / usdPrice).toFixed(2)
    }

    return (
        <section
            className={clsx(
                " mx-auto flex max-w-[1380px] gap-10 w-full",
                subCom ? "" : "container",
            )}
        >
            <div
                className={clsx(
                    "flex flex-col gap-8 "
                )}
            >
                <div className="flex flex-col gap-2">
                    <p className="font-semibold">Estimated Earnings</p>
                    <div className="rounded-md border p-6 shadow-sm  flex flex-col gap-10 w-[340px] bg-white">
                        <MonthEarning
                            size={24}
                            title="Total Monthly Earnings in USD"
                            value={`$${usdPrices?.totalPrice?.toFixed(2)}`} />
                        <MonthEarning
                            size={24}
                            title="Total Monthly Earnings in AKT"
                            value={`${calculateAKTPrice(usdPrices.totalPrice)}AKT`} />
                        <a
                            id={`usage`}
                            href={`#`}
                            target="_blank"
                            className=" rounded-md bg-primary flex justify-center py-2 px-4 gap-1.5"
                        >
                            <p className="font-medium text-white leading-[24px]">Become a Provider</p>
                            <img src={arrowUpRight.src} alt="" />
                        </a>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <p className="font-semibold">Estimated Breakdown</p>
                    <div className="rounded-md border p-6 shadow-sm  flex flex-col gap-10 w-[340px] bg-white">
                        <MonthEarning
                            size={20}
                            title="Total CPU Earnings"
                            value={`$${usdPrices.cpuTotalPrice.toFixed(2)}`} />
                        <MonthEarning
                            size={20}
                            title="Total Memory Earnings"
                            value={`$${usdPrices.memoryTotalPrice.toFixed(2)}`} />
                        <MonthEarning
                            size={20}
                            title="Total Storage Earnings"
                            value={`$${usdPrices.storageTotalPrice.toFixed(2)}`} />
                        <MonthEarning
                            size={20}
                            title="Total Persistent Storage Earnings"
                            value={`$${usdPrices.persistenStorageTotalPrice.toFixed(2)}`} />
                        <MonthEarning
                            size={20}
                            title="Total GPU Earnings"
                            value={`$${usdPrices.gpuTotalPrice.toFixed(2)}`} />
                        <MonthEarning
                            size={20}
                            title="Total IP Earnings"
                            value={`$${usdPrices.ipTotalPrice.toFixed(2)}`} />
                        <MonthEarning
                            size={20}
                            title="Total Endpoint Earnings"
                            value={`$${usdPrices.endpointTotalPrice.toFixed(2)}`} />
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-2 w-full">
                <p className="font-semibold">Estimated Earnings</p>
                <div className="rounded-md border p-6 shadow-sm bg-white">
                    <div className="border-b pb-8">
                        <PricingUnit
                            title="Provider Utilization"
                            content="Usage % (Leases in your provider)"
                            position="items-center"
                            max={max.leasePercentInput}
                            progress={leasePercentInput}
                            setProgress={setLeasePercentInput}
                        />
                    </div>
                    <div className="py-8">
                        <p className="font-semibold text-black">
                            Resources pricing
                        </p>
                        <p className="font-medium">
                            Usage % (Leases in your provider)
                        </p>
                    </div>
                    <div className="flex flex-col gap-7">
                        <div className="flex items-start gap-10 justify-between pb-7 border-b">
                            <img src={CpuBrand.src} alt="" />
                            <PricingUnit
                                title="CPU"
                                content="vCPU"
                                max={max.cpuInput}
                                progress={cpuInput}
                                setProgress={setCpuInput} />
                            <PricingUnit
                                title="CPU Pricing"
                                content="USD / thread-month"
                                max={max.cpuPricing}
                                progress={cpuPricing}
                                setProgress={setCpuPricing} />
                        </div>
                        <div className="flex items-start gap-10 justify-between pb-7 border-b">
                            <img src={MemoryBrand.src} alt="" />
                            <PricingUnit
                                title="Memory"
                                content="Gi"
                                max={max.memoryInput}
                                progress={memoryInput}
                                setProgress={setMemoryInput} />
                            <PricingUnit
                                title="Memory Pricing"
                                content="USD / GB-month"
                                max={max.memoryPricing}
                                progress={memoryPricing}
                                setProgress={setMemoryPricing} />
                        </div>
                        <div className="flex items-start gap-10 justify-between pb-7 border-b">
                            <img src={StorageBrand.src} alt="" />
                            <PricingUnit
                                title="Ephemeral Storage"
                                content="Gi"
                                max={max.storageInput}
                                progress={storageInput}
                                setProgress={setStorageInput} />
                            <PricingUnit
                                title="Storage Pricing"
                                content="USD / GB-month"
                                max={max.storagePricing}
                                progress={storagePricing}
                                setProgress={setStoragePricing} />
                        </div>
                        <div className="flex items-start gap-10 justify-between pb-7 border-b">
                            <img src={StorageBrand.src} alt="" />
                            <PricingUnit
                                title="Persistent Storage"
                                content="Gi"
                                max={max.persistentStorageInput}
                                progress={persistentStorageInput}
                                setProgress={setPersistentStorageInput} />
                            <PricingUnit
                                title="Storage Pricing"
                                content="USD / GB-month"
                                max={max.persistentStoragePricing}
                                progress={persistentStoragePricing}
                                setProgress={setPersistentStoragePricing} />
                        </div>
                        <div className="flex items-start gap-10 justify-between pb-7 border-b">
                            <img src={GpuBrand.src} alt="" />
                            <PricingUnit
                                title="GPUs"
                                content="Unit"
                                max={max.gpuInput}
                                progress={gpuInput}
                                setProgress={setGPUInput} />
                            <PricingUnit
                                title="GPU Pricing"
                                content="GPU pricing per Unit"
                                max={max.gpuPricing}
                                progress={gpuPricing}
                                setProgress={setGPUPricing} />
                        </div>
                        <div className="flex items-start gap-10 justify-between pb-7 border-b">
                            <img src={IpsBrand.src} alt="" />
                            <PricingUnit
                                title="IPs"
                                content="Unit"
                                max={max.ipInput}
                                progress={ipInput}
                                setProgress={setIpInput} />
                            <PricingUnit
                                title="IP Pricing"
                                content="USD / unit-month"
                                max={max.ipPricing}
                                progress={ipPricing}
                                setProgress={setIpPricing} />
                        </div>
                        <div className="flex items-start gap-10 justify-between pb-7">
                            <img src={EndpointBrand.src} alt="" />
                            <PricingUnit
                                title="Endpoints"
                                content="Unit"
                                max={max.endpointInput}
                                progress={endpointInput}
                                setProgress={setEndpointInput} />
                            <PricingUnit
                                title="Endpoint Pricing"
                                content="USD / port-month"
                                max={max.endpointPricing}
                                progress={endpointPricing}
                                setProgress={setEndpointPricing} />
                        </div>
                    </div>
                </div>
            </div>
        </section >
    );
};
