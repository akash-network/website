import { BASE_API_URL } from "@/lib/constants";
import type { ApiProviderDetail } from "@/types/provider";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export async function getProviderDetail(
  owner: string,
): Promise<ApiProviderDetail> {
  const response = await axios.get(`${BASE_API_URL}/v1/providers/${owner}`);
  return response.data;
}

export function useProviderDetail(owner: string | null) {
  return useQuery<ApiProviderDetail, Error>({
    queryKey: ["PROVIDER_DETAIL", owner],
    queryFn: () => getProviderDetail(owner as string),
    enabled: !!owner,
    refetchInterval: 30000,
    retry: 2,
  });
}
