const API_KEY = import.meta.env.VITE_BIRDEYE_API_KEY || '';
const BASE_URL = 'https://public-api.birdeye.so';

const headers = () => ({
  'X-API-KEY': API_KEY,
  'Accept': 'application/json',
  'x-chain': 'solana',
});

export interface TrendingToken {
  address: string;
  symbol: string;
  name: string;
  price: number;
  price24hChangePercent: number;
  volume24h: number;
  marketcap: number;
  rank: number;
  logoURI?: string;
}

export interface NewToken {
  address: string;
  symbol: string;
  name: string;
  listTime: number;
  liquidity: number;
  price: number;
  logoURI?: string;
}

export interface TokenSecurity {
  address: string;
  ownerBalance: number;
  ownerPercentage: number;
  creatorBalance: number;
  creatorPercentage: number;
  top10HolderBalance: number;
  top10HolderPercent: number;
  isMintable: boolean;
  isFreezeable: boolean;
}

async function apiFetch<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url.toString(), { headers: headers() });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'API returned failure');
  return data.data;
}

export const birdeye = {
  getTrending: (limit = 20) =>
    apiFetch<{ tokens: TrendingToken[] }>('/defi/token_trending', {
      sort_by: 'rank',
      sort_type: 'asc',
      offset: 0,
      limit,
    }),

  getNewListings: (limit = 20) =>
    apiFetch<{ items: NewToken[] }>('/v2/tokens/new_listing', {
      limit,
      meme_platform_enabled: 'true',
    }),

  getTokenSecurity: (address: string) =>
    apiFetch<TokenSecurity>('/defi/token_security', { address }),

  getPrice: (address: string) =>
    apiFetch<{ value: number; updateUnixTime: number }>('/defi/price', { address }),

  getMultiPrice: (addresses: string[]) =>
    apiFetch<Record<string, { value: number }>>('/multi_price', {
      list_address: addresses.join(','),
    }),

  getTokenOverview: (address: string) =>
    apiFetch<{
      address: string;
      symbol: string;
      name: string;
      price: number;
      priceChange24hPercent: number;
      volume24h: number;
      marketcap: number;
      holder: number;
      liquidity: number;
    }>('/defi/token_overview', { address }),
};
