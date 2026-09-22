import { BASE_API_URL } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface ActiveLeasesGraphSnapshot {
  date: string;
  value: number;
}

export interface ActiveLeasesGraphData {
  currentValue: number;
  compareValue: number;
  snapshots: ActiveLeasesGraphSnapshot[];
}

export async function getProviderActiveLeasesGraph(
  owner: string,
): Promise<ActiveLeasesGraphData> {
  const response = await axios.get(
    `${BASE_API_URL}/v1/providers/${owner}/active-leases-graph-data`,
  );
  return response.data;
}

export function useActiveLeasesGraph(owner: string | null) {
  return useQuery<ActiveLeasesGraphData, Error>({
    queryKey: ["PROVIDER_ACTIVE_LEASES_GRAPH", owner],
    queryFn: () => getProviderActiveLeasesGraph(owner as string),
    enabled: !!owner,
    retry: 2,
  });
}
