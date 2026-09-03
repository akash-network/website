import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Layers, CircleDollarSign, ShieldCheck } from 'lucide-react'

const LAYERS = [
  {
    step: '01',
    Icon: Layers,
    title: 'Manifest Transparency',
    body: 'SDL manifest is signed and public. Every hardware constraint and pricing cap is verifiable by any party before a lease is opened.',
    parties: ['Tenant', 'Network'],
    text: 'text-blue-400',
    border: 'border-blue-900/50',
    bg: 'bg-blue-950/20',
  },
  {
    step: '02',
    Icon: CircleDollarSign,
    title: 'Automated Economic Settlement',
    body: 'Escrow initialized at the locked bid rate and drawn down per block. Stops immediately if the container is torn down. No trailing charges.',
    parties: ['Network', 'Provider'],
    text: 'text-purple-400',
    border: 'border-purple-900/50',
    bg: 'bg-purple-950/20',
  },
  {
    step: '03',
    Icon: ShieldCheck,
    title: 'Provider Permissioning',
    body: 'Independent auditor wallets verify hardware inventories and write signed attestations on-chain. Tenants filter to verified providers only.',
    parties: ['Network', 'Provider'],
    text: 'text-green-400',
    border: 'border-green-900/50',
    bg: 'bg-green-950/20',
  },
]

export function P2PCoordinationDiagram() {
  const [visible, setVisible] = useState<number[]>([])

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    LAYERS.forEach((_, i) => {
      timers.push(setTimeout(() => setVisible((prev) => [...prev, i]), 400 + i * 600))
    })
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div
      className="dark flex flex-col overflow-hidden rounded-xl border border-border bg-background"
      style={{ aspectRatio: '1 / 1' }}
    >
      <div className="flex shrink-0 items-center gap-1.5 border-b border-defaultBorder bg-card px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
        <span className="ml-3 font-mono text-[10px] text-para">p2p-trust-architecture</span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5 lg:p-7">

        {/* Header */}
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] font-medium text-foreground">Trust Architecture</span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-green-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
            3 layers active
          </span>
        </div>

        {/* Three trust layer rows */}
        {LAYERS.map((layer, i) => (
          <div
            key={i}
            className={cn(
              'flex gap-3 rounded-lg border p-3 transition-all duration-500',
              layer.border, layer.bg,
              visible.includes(i) ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-3',
            )}
          >
            <div className={cn(
              'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold',
              layer.text, layer.border,
            )}>
              {layer.step}
            </div>

            <div className="flex flex-1 flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <p className={cn('text-[11px] font-semibold', layer.text)}>{layer.title}</p>
                <div className="flex shrink-0 gap-1">
                  {layer.parties.map((p) => (
                    <span
                      key={p}
                      className={cn('rounded border px-1 py-0.5 text-[8px] font-medium', layer.border, layer.text)}
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-[9px] leading-relaxed text-para">{layer.body}</p>
            </div>
          </div>
        ))}

        {/* Network status footer */}
        <div className={cn(
          'mt-auto shrink-0 rounded-md border border-defaultBorder bg-card px-3 py-2 transition-opacity duration-700',
          visible.length === LAYERS.length ? 'opacity-100' : 'opacity-0',
        )}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-para">Network settlement</span>
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Trustless · Automated
            </span>
          </div>
        </div>

      </div>
    </div>
  )
}
