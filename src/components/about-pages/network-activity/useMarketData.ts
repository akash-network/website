import { BASE_API_URL } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
const isProd = import.meta.env.PROD;

export interface MarketData {
  price: number;
  volume: number;
  marketCap: number;
  marketCapRank: number;
  priceChange24h: number;
  priceChangePercentage24: number;
}

const mockData: MarketData = {
  price: 1.77,
  volume: 4355039,
  marketCap: 394215199,
  marketCapRank: 134,
  priceChange24h: -0.10559490570214,
  priceChangePercentage24: -5.63177,
};

async function getMarketData(): Promise<MarketData> {
  if (isProd) {
    const response = await axios.get(`${BASE_API_URL}/marketdata`);
    return response.data;
  } else {
    return mockData;
  }
}

export function useMarketData() {
  return useQuery<MarketData, Error>({
    queryKey: ["MARKET_DATA"],
    queryFn: getMarketData,
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    //   initialData: initialData,
  });
}
