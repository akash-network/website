import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Chart } from "react-google-charts";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import {
  useDashboardData,
  useProviderDetail,
} from "../about-pages/network-activity/useDashboardData";
import { Skeleton } from "../ui/skeleton";

const queryClient = new QueryClient();

const Map = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <PieCharts />
      <MapData />
    </QueryClientProvider>
  );
};

export default Map;

const PieCharts = () => {
  const { data: dashboardData, error, isLoading } = useDashboardData();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex flex-col rounded-lg border bg-background2 p-5 shadow-sm"
          >
            <Skeleton className="h-6 w-24" />
            <Skeleton className="mt-2 h-4 w-32" />
            <Skeleton className="mt-5 h-[130px] w-full 2xl:h-[200px]" />
            <div className="mt-5 flex flex-col items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-red-500">Error loading network capacity data</p>
      </div>
    );
  }

  if (!dashboardData?.networkCapacity) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>No network capacity data available</p>
      </div>
    );
  }

  const {
    activeCPU = 0,
    pendingCPU = 0,
    totalCPU = 0,
    activeGPU = 0,
    pendingGPU = 0,
    totalGPU = 0,
    activeMemory = 0,
    availableMemory = 0,
    activeStorage = 0,
    availableStorage = 0,
  } = dashboardData.networkCapacity;

  const cpuData = [
    +((activeCPU + pendingCPU) / 1000).toFixed(2),
    +((totalCPU - activeCPU - pendingCPU) / 1000).toFixed(2),
  ];

  const gpuData = [
    +(activeGPU + pendingGPU).toFixed(2),
    +(totalGPU - activeGPU - pendingGPU).toFixed(2),
  ];

  const BYTES_TO_TB = 1000000000000;
  const memoryData = [
    +(activeMemory / BYTES_TO_TB).toFixed(2),
    +(availableMemory / BYTES_TO_TB).toFixed(2),
  ];

  const storageData = [
    +(activeStorage / BYTES_TO_TB).toFixed(2),
    +(availableStorage / BYTES_TO_TB).toFixed(2),
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <CustomChart title="CPU" data={cpuData} ceil sub="CPU" />
      <CustomChart title="GPU" data={gpuData} ceil sub="GPU" />
      <CustomChart title="Memory" data={memoryData} sub="TB" />
      <CustomChart title="Storage" data={storageData} sub="TB" />
    </div>
  );
};

const CustomChart = ({
  title,
  data,
  ceil,
  sub,
}: {
  title: string;
  data: number[];
  ceil?: boolean;
  sub?: string;
}) => {
  const total = (data[0] + data[1]).toFixed(2);
  const active = ceil ? Math.ceil(data[0]) || 0 : data[0] || 0;
  const available = ceil ? Math.ceil(data[1]) || 0 : data[1] || 0;

  return (
    <div className="flex flex-col rounded-lg border bg-background2 p-5 shadow-sm">
      <div className="flex flex-1 flex-col">
        <h2 className="font-semibold">{title}</h2>
        <p className="mt-1 text-xs text-para">
          {active} {sub} / {total} {sub}
        </p>
      </div>

      <div className="mt-5 h-px w-full border-t" />

      <Chart
        width="100%"
        chartType="PieChart"
        className="mt-5 h-[130px] 2xl:h-[200px]"
        loader={<div>Loading chart...</div>}
        data={[
          ["title", "value"],
          ["Active", data[0] ?? 0],
          ["Available", data[1] ?? 0],
        ]}
        options={{
          legend: "none",
          pieSliceText: "value",
          sliceVisibilityThreshold: 0,
          theme: "maximized",
          enableInteractivity: false,
          backgroundColor: "transparent",
          colors: ["#ff414c", "#7e868c"],
          pieSliceBorderColor: "transparent",
          pieSliceTextStyle: { fontSize: 12 },
        }}
      />

      <div className="mt-5 flex flex-col items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <p className="text-xs text-para">Active: {active}</p>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#7e868c]" />
          <p className="text-xs text-para">Available: {available}</p>
        </div>
      </div>
    </div>
  );
};

const MapData = () => {
  const { data: providers, isError, isLoading } = useProviderDetail();

  if (isLoading) {
    return (
      <div className="mt-10 flex flex-col gap-6 ">
        <Skeleton className="h-8 w-48 rounded border shadow-sm  dark:bg-background2" />
        <Skeleton className="h-[400px] w-full rounded border shadow-sm dark:bg-background2" />
      </div>
    );
  }

  if (isError) {
    return <div>Error loading provider data</div>;
  }

  const activeProviders =
    providers?.filter((provider) => provider.isOnline) ?? [];

  return (
    <div className="mt-10 flex flex-col gap-6">
      <h2 className="text-base font-semibold md:text-xl">
        {activeProviders.length} Active Providers
      </h2>

      <ComposableMap
        className="border bg-background2"
        projectionConfig={{ rotate: [-10, 0, 0] }}
      >
        <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json">
          {({ geographies }) =>
            geographies.map((geo, index) => (
              <Geography
                key={index}
                geography={geo}
                className="fill-[#DCDCDC] dark:fill-[#404040]"
                style={{
                  default: { outline: "none" },
                  hover: { outline: "none" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {activeProviders.map(({ ipLon, ipLat }) => (
          <Marker
            key={`${ipLon}-${ipLat}`}
            coordinates={[parseFloat(ipLon), parseFloat(ipLat)]}
          >
            <circle
              className="h-4 w-4 text-background2"
              fill="#FF414C"
              stroke="currentColor"
              strokeWidth={1}
              r={6}
            />
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
};
