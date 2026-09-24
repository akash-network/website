import { BASE_API_URL } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { ProviderResourceStat } from "@/types/provider";

export interface NetworkCapacity {
  resources: {
    cpu: ProviderResourceStat;
    gpu: ProviderResourceStat;
    memory: ProviderResourceStat;
    storage: {
      ephemeral: ProviderResourceStat;
      persistent: ProviderResourceStat;
      total: ProviderResourceStat;
    };
  };
  activeProviderCount: number;
}

export async function getNetworkCapacity(): Promise<NetworkCapacity> {
  const response = await axios.get(`${BASE_API_URL}/v1/network-capacity`);
  return response.data;
}

export function useNetworkCapacity() {
  return useQuery<NetworkCapacity, Error>({
    queryKey: ["NETWORK_CAPACITY"],
    queryFn: getNetworkCapacity,
    refetchInterval: 30000,
    retry: 2,
  });
}
