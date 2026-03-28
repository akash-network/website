import axios from 'axios'
import { BASE_API_URL } from '@/lib/constants'
import { type Provider } from '@/components/home/gpu-providers/types.ts'

export interface ProviderDataResponse {
  stats: {
    activeLeases: number;
    activeProviders: number;
    memory: string;
    cpu: number;
    storage: string;
    totalGpu: number;
    avgLatency: string;
    uptime: string;
  };
  providers: Provider[];
}

// -------------------------------------------------------------------
// Fallback data (shown if API fails and no cache exists)
// -------------------------------------------------------------------
export const FALLBACK_STATS: ProviderDataResponse['stats'] = {
  activeLeases: 675,
  activeProviders: 58,
  memory: '5.1 TB',
  cpu: 2380870,
  storage: '23.2 TB',
  totalGpu: 185,
  avgLatency: '42ms',
  uptime: '99.9%',
};

export const FALLBACK_PROVIDERS: Provider[] = [
  {
    id: 'akash1fallback1',
    name: 'Overclock Labs',
    lat: 37.7749,
    lng: -122.4194,
    location: 'California, US',
    locationFlag: '🇺🇸',
    uptime: '99.98%',
    cpu: '512/1024',
    gpus: '8x NVIDIA A100',
    memory: '512.0GB/1024.0GB',
    storage: '10240.0 GB',
    leases: 120,
    audited: true,
    avgLatency: '38ms',
  },
  {
    id: 'akash1fallback2',
    name: 'Akash Provider EU',
    lat: 52.52,
    lng: 13.405,
    location: 'Berlin, DE',
    locationFlag: '🇩🇪',
    uptime: '99.95%',
    cpu: '256/512',
    gpus: '4x NVIDIA H100',
    memory: '256.0GB/512.0GB',
    storage: '5120.0 GB',
    leases: 85,
    audited: true,
    avgLatency: '22ms',
  },
  {
    id: 'akash1fallback3',
    name: 'Moondance Labs',
    lat: 35.6762,
    lng: 139.6503,
    location: 'Tokyo, JP',
    locationFlag: '🇯🇵',
    uptime: '99.90%',
    cpu: '128/256',
    gpus: '2x NVIDIA A100',
    memory: '128.0GB/256.0GB',
    storage: '2048.0 GB',
    leases: 42,
    audited: true,
    avgLatency: '55ms',
  },
  {
    id: 'akash1fallback4',
    name: 'Eureka Labs',
    lat: -23.5505,
    lng: -46.6333,
    location: 'São Paulo, BR',
    locationFlag: '🇧🇷',
    uptime: '99.85%',
    cpu: '64/128',
    gpus: '0',
    memory: '64.0GB/128.0GB',
    storage: '1024.0 GB',
    leases: 18,
    audited: false,
    avgLatency: '95ms',
  },
  {
    id: 'akash1fallback5',
    name: 'Praetor App',
    lat: 28.6139,
    lng: 77.209,
    location: 'New Delhi, IN',
    locationFlag: '🇮🇳',
    uptime: '99.80%',
    cpu: '32/64',
    gpus: '0',
    memory: '32.0GB/64.0GB',
    storage: '512.0 GB',
    leases: 9,
    audited: false,
    avgLatency: '112ms',
  },
];

export const FALLBACK_DATA: ProviderDataResponse = {
  stats: FALLBACK_STATS,
  providers: FALLBACK_PROVIDERS,
};

// -------------------------------------------------------------------
// Cache helpers
// -------------------------------------------------------------------
const CACHE_KEY = 'akash-provider-data';
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

function bytesToGB(bytes: number) {
  return (bytes / 1024 / 1024 / 1024).toFixed(1);
}

function formatWithUnit(bytes: number) {
  const tb = bytes / (1024 ** 4);
  if (tb >= 1) return `${tb.toFixed(1)} TB`;
  const gb = bytes / (1024 ** 3);
  return `${gb.toFixed(1)} GB`;
}

// -------------------------------------------------------------------
// Server-side fetch (builds initial data at build/SSR time)
// -------------------------------------------------------------------
export async function fetchProviderData(): Promise<ProviderDataResponse> {
  try {
    const [resDashboard, resProviders] = await Promise.all([
      axios.get(`${BASE_API_URL}/v1/dashboard-data`),
      axios.get(`${BASE_API_URL}/v1/providers`),
    ]);

    return parseProviderResponse(resDashboard.data, resProviders.data);
  } catch (error) {
    console.error('Error fetching provider/dashboard data (build time):', error);
    return FALLBACK_DATA;
  }
}

// -------------------------------------------------------------------
// Client-side fetch with localStorage cache + fallback
// -------------------------------------------------------------------
export async function fetchProviderDataClient(): Promise<ProviderDataResponse> {
  // 1. Try to serve from cache first (to make UI feel instant)
  const cached = loadCache();

  try {
    const [resDashboard, resProviders] = await Promise.all([
      fetch(`${BASE_API_URL}/v1/dashboard-data`).then((r) => {
        if (!r.ok) throw new Error('dashboard-data failed');
        return r.json();
      }),
      fetch(`${BASE_API_URL}/v1/providers`).then((r) => {
        if (!r.ok) throw new Error('providers failed');
        return r.json();
      }),
    ]);

    const result = parseProviderResponse(resDashboard, resProviders);
    saveCache(result);
    return result;
  } catch (error) {
    console.warn('Client fetch failed, using cache or fallback:', error);
    return cached ?? FALLBACK_DATA;
  }
}

// -------------------------------------------------------------------
// Shared parser
// -------------------------------------------------------------------
function parseProviderResponse(dashboardData: any, rawProviders: any): ProviderDataResponse {
  const providersRaw = Array.isArray(rawProviders)
    ? rawProviders
    : rawProviders?.data || rawProviders?.providers || [];

  const stats: ProviderDataResponse['stats'] = {
    activeLeases: dashboardData.now?.activeLeaseCount ?? 0,
    activeProviders: dashboardData.networkCapacity?.activeProviderCount ?? 0,
    memory: formatWithUnit(dashboardData.now?.activeMemory ?? 0),
    cpu: Math.round(dashboardData.now?.activeCPU ?? 0),
    storage: formatWithUnit(dashboardData.now?.activeStorage ?? 0),
    totalGpu: dashboardData.networkCapacity?.totalGPU ?? 0,
    avgLatency: '42ms',
    uptime: '99.9%',
  };

  const providers: Provider[] = providersRaw
    .filter((p: any) =>
      p.ipLat && p.ipLon &&
      (p.isOnline !== undefined ? p.isOnline : true)
    )
    .map((p: any) => ({
      id: p.owner,
      name: p.organization || p.owner.slice(0, 10),
      lat: Number(p.ipLat),
      lng: Number(p.ipLon),
      location: `${p.ipRegion || ''}${p.ipRegion && p.ipCountry ? ', ' : ''}${p.ipCountry || ''}` || 'Unknown',
      locationFlag: '',
      uptime: `${((p.uptime30d ?? 0) * 100).toFixed(2)}%`,
      cpu: `${p.stats?.cpu?.active ?? 0}/${p.stats?.cpu?.total ?? 0}`,
      gpus: p.stats?.gpu?.total > 0 ? `${p.stats.gpu.total}x ${p.gpuModels?.[0] || 'GPU'}` : '0',
      memory: `${bytesToGB(p.stats?.memory?.active ?? 0)}GB/${bytesToGB(p.stats?.memory?.total ?? 0)}GB`,
      storage: `${bytesToGB(p.stats?.storage?.total?.total ?? 0)} GB`,
      leases: p.leaseCount ?? 0,
      audited: p.isAudited ?? false,
      avgLatency: '42ms',
    }))
    .sort((a: any, b: any) => parseFloat(b.uptime) - parseFloat(a.uptime))
    .slice(0, 150);

  return { stats, providers };
}

// -------------------------------------------------------------------
// localStorage helpers
// -------------------------------------------------------------------
function loadCache(): ProviderDataResponse | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.data || !parsed?.timestamp) return null;
    if (Date.now() - parsed.timestamp > CACHE_TTL) return null;
    return parsed.data as ProviderDataResponse;
  } catch {
    return null;
  }
}

function saveCache(data: ProviderDataResponse) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch { }
}