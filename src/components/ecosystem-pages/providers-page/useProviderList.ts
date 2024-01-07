import { BASE_API_URL } from "@/lib/constants";
import type { ApiProviderList } from "@/types/provider";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const isProd = import.meta.env.PROD;

export async function getProviderList() {
  const response = await axios.get(`${BASE_API_URL}/providers`);

  return response.data;
}

export function useProviderList({ initialProviders }: any) {
  return useQuery(["PROVIDER_LIST"], () => getProviderList(), {
    initialData: initialProviders,
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
  });
}
