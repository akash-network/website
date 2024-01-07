import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Chart } from "react-google-charts";
import React from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";

import {
  useDashboardData,
  useProviderDetail,
} from "../about-pages/network-activity/useDashboardData";
const queryClient = new QueryClient();
const Map = ({
  initialData,
  initialData2,
}: {
  initialData: any;
  initialData2: any;
}) => {
  console.log(initialData);

  return (
    <QueryClientProvider client={queryClient}>
      <PieCharts initialData={initialData2} />
      <MapData initialData={initialData} />
    </QueryClientProvider>
  );
};

export default Map;

const PieCharts = ({ initialData }: { initialData: any }) => {
  console.log(initialData);

  const dashboard = useDashboardData({ initialData });
  const dashboardData = dashboard?.data;
  const cpuData = [
    +(
      (dashboardData.networkCapacity.activeCPU +
        dashboardData.networkCapacity.pendingCPU) /
      1000
    )?.toFixed(2),
    +(
      (dashboardData.networkCapacity.totalCPU -
        dashboardData.networkCapacity.activeCPU -
        dashboardData.networkCapacity.pendingCPU) /
      1000
    )?.toFixed(2),
  ];

  const gpuData = [
    +(
      dashboardData.networkCapacity.activeGPU +
      dashboardData.networkCapacity.pendingGPU
    )?.toFixed(2),
    +(
      dashboardData.networkCapacity.totalGPU -
      dashboardData.networkCapacity.activeGPU -
      dashboardData.networkCapacity.pendingGPU
    )?.toFixed(2),
  ];

  //bytes to TB
  const memoryData = [
    +(dashboardData.networkCapacity.activeMemory / 1000000000000).toFixed(2),
    +(dashboardData.networkCapacity.availableMemory / 1000000000000).toFixed(2),
  ];

  const storageData = [
    +(dashboardData.networkCapacity.activeStorage / 1000000000000).toFixed(2),
    +(dashboardData.networkCapacity.availableStorage / 1000000000000).toFixed(
      2,
    ),
  ];
  console.log(memoryData, "memoryData", gpuData, storageData);

  return (
    <div className="mt-10 grid grid-cols-2 gap-4 md:mt-20 md:grid-cols-2 lg:grid-cols-4">
      <CustomChart title={"CPU"} data={cpuData} ceil sub={"CPU"} />
      <CustomChart title={"GPU"} data={gpuData} ceil sub={"GPU"} />
      <CustomChart title={"Memory"} data={memoryData} sub={"TB"} />
      <CustomChart title={"Storage"} data={storageData} sub={"TB"} />
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
  return (
    <div className="flex flex-col rounded-lg  border bg-background2 p-5 shadow-sm">
      <div className="flex flex-1 flex-col ">
        <h1 className="font-bold">{title}</h1>
        <p className="mt-1 text-xs text-para">
          {data[0] || 0} {sub} / {(data[1] + data[0]).toFixed(2) || 0} {sub}
        </p>
      </div>
      <div className="mt-5 h-px w-full  border-t" />
      <Chart
        width={"100%"}
        chartType="PieChart"
        className="mt-5  h-[130px] 2xl:h-[200px]"
        //chart width and height should be

        loader={<div></div>}
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
        }}
      />
      <div className="mt-5 flex flex-col items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <p className="text-xs text-para">
            Active : {ceil ? Math.ceil(data[0]) || 0 : data[0] || 0}
          </p>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#7e868c]" />
          <p className="text-xs text-para">
            Available :{ceil ? Math.ceil(data[1]) || 0 : data[1] || 0}
          </p>
        </div>
      </div>
    </div>
  );
};

const MapData = ({ initialData }: { initialData: any }) => {
  console.log(initialData);
  const activeProviders = useProviderDetail({ initialData });
  console.log(activeProviders.data);

  const error = activeProviders?.isError;
  const activeProvidersData = activeProviders?.data?.filter(
    (x) => x.isOnline || x.isOnline,
  );

  return (
    <div className="mt-10 flex flex-col gap-6">
      <h1 className="text-base font-semibold md:text-xl">
        {activeProvidersData?.length} Active Providers
      </h1>
      <ComposableMap
        className="border bg-background2"
        projectionConfig={{ rotate: [-10, 0, 0] }}
      >
        <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json">
          {({ geographies }: any) =>
            geographies.map((geo: any, index: number) => (
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
        {error && <Marker coordinates={[0, 0]}>No data available</Marker>}
        {activeProviders?.data
          ?.filter((x) => x.isOnline || x.isOnline)
          .map(
            ({ owner, name, ipLon, ipLat, ipRegion, ipCountryCode }: any) => {
              return (
                <Marker coordinates={[parseFloat(ipLon), parseFloat(ipLat)]}>
                  <circle
                    className={"h-4 w-4 text-background2"}
                    fill={"#FF414C"}
                    stroke="currentColor"
                    strokeWidth={1}
                    r={6}
                  />
                </Marker>
              );
            },
          )}
      </ComposableMap>
    </div>
  );
};
