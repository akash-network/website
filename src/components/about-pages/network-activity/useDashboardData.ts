import { BASE_API_URL } from "@/lib/constants";
import type { DashboardData } from "@/types/dashboard";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export async function getDashboardData(): Promise<DashboardData> {
  const response = await axios.get(`${BASE_API_URL}/dashboardData`);
  return response.data;
}

export async function getProviderDetail() {
  const response = await axios.get(`${BASE_API_URL}/providers`);

  return response.data;
}

interface ProviderDetail {
  owner: string;
  name: string;
  ipLon: string;
  ipLat: string;
  ipRegion: string;
  ipCountryCode: string;
  isOnline: boolean;
}

export function useDashboardData({
  initialData,
}: {
  initialData: DashboardData;
}) {
  return useQuery<DashboardData, Error>({
    queryKey: ["DASHBOARD_DATA"],
    queryFn: getDashboardData,
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    initialData: initialData,
  });
}
// owner, name, ipLon, ipLat, ipRegion, ipCountryCode
export function useProviderDetail({
  initialData,
}: {
  initialData: ProviderDetail[];
}) {
  return useQuery<ProviderDetail[], Error>({
    queryKey: ["PROVIDER_DETAIL"],
    queryFn: getProviderDetail,
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    initialData: initialData,
  });
}
