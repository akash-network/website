import { BASE_API_URL } from "@/lib/constants";
import type { ApiProviderList } from "@/types/provider";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const isProd = import.meta.env.PROD;

export async function getProviderList(): Promise<ApiProviderList[]> {
  try {
    const response = await axios.get(`${BASE_API_URL}/providers`);
    
    // Handle case where response.data might be an array directly or wrapped
    const data = Array.isArray(response.data) ? response.data : response.data?.data || response.data?.providers || [];
    
    return data;
  } catch (error) {
    console.error("Error fetching provider list:", error);
    throw error;
  }
}

export function useProviderList() {
  return useQuery<ApiProviderList[], Error>({
    queryKey: ["PROVIDER_LIST"],
    queryFn: getProviderList,
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    retry: 3,
    retryDelay: 1000,
  });
}
