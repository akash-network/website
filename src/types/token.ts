/**
 * Token market data from CoinGecko API
 */
export interface TokenMarketData {
  market_data: {
    circulating_supply: number;
    total_supply: number;
    max_supply: number;
    current_price: {
      usd: number;
    };
    market_cap: {
      usd: number;
    };
    total_volume: {
      usd: number;
    };
    last_updated: string;
  };
}

/**
 * FAQ item structure
 */
export interface FAQ {
  title: string;
  description: string;
}

/**
 * Section data structure
 */
export interface SectionData {
  [key: string]: unknown;
}
