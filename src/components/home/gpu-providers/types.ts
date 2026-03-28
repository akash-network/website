export interface Provider {
  id: string
  name: string
  lat: number
  lng: number
  location: string
  locationFlag: string
  uptime: string
  cpu: string
  gpus: string
  memory: string
  storage: string
  leases: number
  audited: boolean
  avgLatency: string
}