import { useState, useEffect, useCallback } from "react";

// ── Layout ─────────────────────────────────────────────────────────────────────
const VW = 760;
const VH = 480;
const NW = 116;
const NH = 38;
const NR = 5;

const XS = [68, 206, 344, 482, 620]; // 5 column x-centers

const PROV_CY = 74;
const MKT_Y1 = 182;
const MKT_Y2 = 272;
const TENT_CY = 412;
const MKT_X1 = 8;
const MKT_X2 = 752;

// Line endpoints (tight gap between node edge and marketplace)
const P_LY = PROV_CY + NH / 2 + 1;
const M_TY = MKT_Y1 - 1;
const M_BY = MKT_Y2 + 1;
const T_LY = TENT_CY - NH / 2 - 1;

const PROV_LABELS = ['Provider 01', 'Provider 02', 'Provider 03', 'Provider 04', 'Provider "N"'];
const TENT_LABELS = ['Tenant 01', 'Tenant 02', 'Tenant 03', 'Tenant 04', 'Tenant "N"'];
const BID_PRICES = ['$1.18/hr', '$1.31/hr', '$1.23/hr', '$1.67/hr', '$1.45/hr'];
const BID_DURS = ['1.10s', '1.30s', '1.05s', '1.40s', '1.20s'];
const IDLE_DURS_UP = ['2.40s', '2.78s', '2.20s', '2.95s', '2.55s'];
const IDLE_DURS_DN = ['3.10s', '2.85s', '3.40s', '2.70s', '3.20s'];

type Phase = 'idle' | 'broadcast' | 'auction' | 'bids' | 'lease';

const MKT_STATES: Record<Phase, { title: string; sub: string; titleColor: string }> = {
  idle:      { title: 'OPEN MARKETPLACE LEDGER', sub: 'Broadcast layer for container deployment manifests', titleColor: '#374151' },
  broadcast: { title: 'MANIFEST RECEIVED', sub: 'Processing SDL configuration from tenant…', titleColor: '#34d399' },
  auction:   { title: '── AUCTION OPEN ──', sub: 'Broadcasting manifest to active providers…', titleColor: '#60a5fa' },
  bids:      { title: 'BIDS RECEIVED', sub: 'Select a provider to establish the lease', titleColor: '#f59e0b' },
  lease:     { title: 'LEASE ACTIVE', sub: 'Cryptographic contract established on-chain', titleColor: '#4ade80' },
};

const STATUS: Record<Phase, string> = {
  idle:      '● Idle — click any Tenant node to broadcast a deployment manifest',
  broadcast: '● Broadcasting SDL manifest to marketplace ledger…',
  auction:   '● Auction open — collecting bids from active network providers…',
  bids:      '● Bids received — click a Provider node to establish the lease',
  lease:     '● Lease active — cryptographic contract written to chain',
};

export default function MarketplaceTopology() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [selTenant, setSelTenant] = useState<number | null>(null);
  const [selProvider, setSelProvider] = useState<number | null>(null);
  const [tick, setTick] = useState(0);

  const handleTenantClick = useCallback((i: number) => {
    if (phase !== 'idle' && phase !== 'lease') return;
    setSelTenant(i);
    setSelProvider(null);
    setPhase('broadcast');
    setTick(t => t + 1);
  }, [phase]);

  const handleProviderClick = useCallback((i: number) => {
    if (phase !== 'bids') return;
    setSelProvider(i);
    setPhase('lease');
  }, [phase]);

  const handleReset = useCallback(() => {
    setPhase('idle');
    setSelTenant(null);
    setSelProvider(null);
  }, []);

  useEffect(() => {
    if (phase !== 'broadcast') return;
    const t = setTimeout(() => setPhase('auction'), 1600);
    return () => clearTimeout(t);
  }, [phase, tick]);

  useEffect(() => {
    if (phase !== 'auction') return;
    const t = setTimeout(() => setPhase('bids'), 1800);
    return () => clearTimeout(t);
  }, [phase]);

  const mkt = MKT_STATES[phase];
  const isLease = phase === 'lease';
  const isBids = phase === 'bids';

  return (
    <div className="w-full overflow-hidden rounded-xl border border-gray-800/80 bg-[#08080f]">
      {/* Terminal chrome */}
      <div className="flex items-center gap-2 border-b border-gray-800/60 bg-[#0c0c18] px-4 py-2.5">
        <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
        <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
        <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
        <span className="ml-2 font-mono text-[11px] text-gray-600">
          akash-network — marketplace topology — interactive simulation
        </span>
        {phase !== 'idle' && (
          <button
            onClick={handleReset}
            className="ml-auto font-mono text-[11px] text-gray-600 transition-colors hover:text-gray-400"
          >
            reset
          </button>
        )}
      </div>

      {/* SVG */}
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        width="100%"
        style={{ display: 'block' }}
        role="img"
        aria-label="Akash Network marketplace topology — interactive diagram"
      >
        <style>{`
          @keyframes ak-march-dn { to { stroke-dashoffset: -10; } }
          @keyframes ak-march-up { to { stroke-dashoffset:  10; } }
          @keyframes ak-pulse    { 0%,100%{opacity:.25} 50%{opacity:.75} }
          @keyframes ak-mktglow  { 0%,100%{opacity:.5}  50%{opacity:1}   }
        `}</style>

        <defs>
          {/* Glow filters */}
          <filter id="ak-glow-xs" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.8" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="ak-glow-sm" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="ak-glow-md" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="7" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>

          {/* Dot-grid background */}
          <pattern id="ak-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.7" fill="#14142a"/>
          </pattern>

          {/* Reference paths for animateMotion (defined in defs so they exist before use) */}
          {XS.map((x, i) => (
            <g key={i}>
              {/* Provider → Marketplace (downward: y increases) */}
              <path id={`ak-pp-${i}`} d={`M ${x} ${P_LY} L ${x} ${M_TY}`} fill="none"/>
              {/* Marketplace → Tenant (downward: y increases) */}
              <path id={`ak-tp-${i}`} d={`M ${x} ${M_BY} L ${x} ${T_LY}`} fill="none"/>
            </g>
          ))}
        </defs>

        {/* Background */}
        <rect width={VW} height={VH} fill="#08080f"/>
        <rect width={VW} height={VH} fill="url(#ak-dots)"/>

        {/* ── Connection lines ─────────────────────────────────────────────── */}
        {XS.map((x, i) => {
          const provLeased = isLease && i === selProvider;
          const provDimmed = isLease && i !== selProvider;
          const tentLeased = isLease && i === selTenant;
          const tentDimmed = !isLease && selTenant !== null && phase !== 'idle' && i !== selTenant;
          const tentSel    = i === selTenant && phase !== 'idle';

          return (
            <g key={i}>
              {/* Provider line */}
              <path
                d={`M ${x} ${P_LY} L ${x} ${M_TY}`}
                fill="none"
                stroke={provLeased ? '#4ade80' : provDimmed ? '#0f0f0f' : isBids ? '#2a3a22' : '#161f16'}
                strokeWidth={provLeased ? 1.5 : 1}
                strokeDasharray={provLeased ? '0' : '6 4'}
                filter={provLeased ? 'url(#ak-glow-xs)' : undefined}
                style={{ animation: provLeased ? undefined : 'ak-march-dn 0.9s linear infinite', transition: 'stroke 0.4s' }}
              />
              {/* Tenant line */}
              <path
                d={`M ${x} ${M_BY} L ${x} ${T_LY}`}
                fill="none"
                stroke={tentLeased ? '#4ade80' : tentDimmed ? '#0f0f0f' : tentSel ? '#1a3828' : '#161f16'}
                strokeWidth={tentLeased ? 1.5 : 1}
                strokeDasharray={tentLeased ? '0' : '6 4'}
                filter={tentLeased ? 'url(#ak-glow-xs)' : undefined}
                style={{ animation: tentLeased ? undefined : 'ak-march-up 0.9s linear infinite', transition: 'stroke 0.4s' }}
              />
            </g>
          );
        })}

        {/* ── Idle ambient packets ─────────────────────────────────────────── */}
        {phase === 'idle' && XS.map((_, i) => (
          <g key={`idle-${i}`}>
            <circle r="2" fill="#1bd4a4" filter="url(#ak-glow-xs)">
              <animateMotion dur={IDLE_DURS_UP[i]} repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear">
                <mpath href={`#ak-tp-${i}`}/>
              </animateMotion>
            </circle>
            <circle r="1.5" fill="#4070c8" filter="url(#ak-glow-xs)" opacity="0.65">
              <animateMotion dur={IDLE_DURS_DN[i]} repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="linear">
                <mpath href={`#ak-pp-${i}`}/>
              </animateMotion>
            </circle>
          </g>
        ))}

        {/* ── Broadcast packet (tenant → marketplace, moves upward) ─────────── */}
        {(phase === 'broadcast' || phase === 'auction') && selTenant !== null && (
          <g key={`bc-${tick}`}>
            <circle r="8" fill="#00d4aa" opacity="0.15" filter="url(#ak-glow-md)">
              <animateMotion dur="1.5s" fill="freeze" keyPoints="1;0" keyTimes="0;1" calcMode="linear">
                <mpath href={`#ak-tp-${selTenant}`}/>
              </animateMotion>
            </circle>
            <circle r="4.5" fill="#00d4aa" filter="url(#ak-glow-sm)">
              <animateMotion dur="1.5s" fill="freeze" keyPoints="1;0" keyTimes="0;1" calcMode="linear">
                <mpath href={`#ak-tp-${selTenant}`}/>
              </animateMotion>
            </circle>
          </g>
        )}

        {/* ── Bid packets (provider → marketplace, moves downward from provider) */}
        {isBids && XS.map((_, i) => (
          <g key={`bid-${i}`}>
            <circle r="3.5" fill="#f59e0b" filter="url(#ak-glow-xs)">
              <animateMotion dur={BID_DURS[i]} repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="linear">
                <mpath href={`#ak-pp-${i}`}/>
              </animateMotion>
            </circle>
          </g>
        ))}

        {/* ── Lease flowing packets (continuous on locked path) ───────────── */}
        {isLease && selTenant !== null && selProvider !== null && (
          <g key="lease-flow">
            <circle r="3" fill="#4ade80" filter="url(#ak-glow-sm)">
              <animateMotion dur="0.85s" repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear">
                <mpath href={`#ak-tp-${selTenant}`}/>
              </animateMotion>
            </circle>
            <circle r="3" fill="#4ade80" filter="url(#ak-glow-sm)">
              <animateMotion dur="0.85s" repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear">
                <mpath href={`#ak-pp-${selProvider}`}/>
              </animateMotion>
            </circle>
          </g>
        )}

        {/* ── Marketplace bar ──────────────────────────────────────────────── */}
        {phase !== 'idle' && (
          <rect
            x={MKT_X1 - 2} y={MKT_Y1 - 2}
            width={MKT_X2 - MKT_X1 + 4} height={MKT_Y2 - MKT_Y1 + 4}
            rx="10"
            fill="none"
            stroke={mkt.titleColor}
            strokeWidth="0.5"
            opacity="0.25"
            filter="url(#ak-glow-sm)"
            style={{ animation: 'ak-mktglow 1.8s ease-in-out infinite' }}
          />
        )}
        <rect
          x={MKT_X1} y={MKT_Y1}
          width={MKT_X2 - MKT_X1} height={MKT_Y2 - MKT_Y1}
          rx="8"
          fill={
            isLease ? '#08150a' :
            isBids ? '#140f00' :
            phase === 'auction' ? '#080d18' :
            phase === 'broadcast' ? '#080f0c' :
            '#0c0c1a'
          }
          stroke={
            isLease ? '#1a3a1e' :
            isBids ? '#3a2800' :
            phase === 'auction' ? '#162040' :
            phase === 'broadcast' ? '#103020' :
            '#161628'
          }
          strokeWidth="1.5"
          style={{ transition: 'fill 0.5s, stroke 0.5s' }}
        />
        <text
          x={VW / 2} y={MKT_Y1 + (MKT_Y2 - MKT_Y1) / 2 - 6}
          textAnchor="middle"
          fill={mkt.titleColor}
          fontSize="11"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          letterSpacing="2"
          fontWeight="700"
          style={{ transition: 'fill 0.4s', userSelect: 'none' }}
        >
          {mkt.title}
        </text>
        <text
          x={VW / 2} y={MKT_Y1 + (MKT_Y2 - MKT_Y1) / 2 + 12}
          textAnchor="middle"
          fill="#374151"
          fontSize="10"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          style={{ userSelect: 'none' }}
        >
          {mkt.sub}
        </text>

        {/* ── Provider nodes ───────────────────────────────────────────────── */}
        {PROV_LABELS.map((label, i) => {
          const isWinner  = isLease && i === selProvider;
          const isDimmed  = isLease && i !== selProvider;

          return (
            <g key={i} onClick={() => handleProviderClick(i)} style={{ cursor: isBids ? 'pointer' : 'default' }}>
              {/* Pulse ring — bids state */}
              {isBids && (
                <rect
                  x={XS[i] - NW / 2 - 5} y={PROV_CY - NH / 2 - 5}
                  width={NW + 10} height={NH + 10} rx={NR + 4}
                  fill="none" stroke="#f59e0b" strokeWidth="1" opacity="0.3"
                  style={{ animation: 'ak-pulse 1.3s ease-in-out infinite' }}
                />
              )}
              {/* Winner glow ring */}
              {isWinner && (
                <rect
                  x={XS[i] - NW / 2 - 3} y={PROV_CY - NH / 2 - 3}
                  width={NW + 6} height={NH + 6} rx={NR + 2}
                  fill="none" stroke="#4ade80" strokeWidth="1.5"
                  filter="url(#ak-glow-xs)"
                />
              )}
              {/* Node body */}
              <rect
                x={XS[i] - NW / 2} y={PROV_CY - NH / 2}
                width={NW} height={NH} rx={NR}
                fill={isWinner ? '#0a1c0a' : isDimmed ? '#090909' : '#111120'}
                stroke={isWinner ? '#4ade80' : isDimmed ? '#141414' : isBids ? '#3a2c10' : '#1c1c30'}
                strokeWidth="1"
                style={{ transition: 'fill 0.3s, stroke 0.3s' }}
              />
              {/* Label */}
              <text
                x={XS[i]} y={PROV_CY + 4}
                textAnchor="middle"
                fill={isWinner ? '#4ade80' : isDimmed ? '#222' : isBids ? '#c4902a' : '#6b7280'}
                fontSize="10.5"
                fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                style={{ transition: 'fill 0.3s', userSelect: 'none' }}
              >
                {label}
              </text>
              {/* Bid price */}
              {isBids && (
                <text
                  x={XS[i]} y={PROV_CY - NH / 2 - 8}
                  textAnchor="middle"
                  fill="#f59e0b" fontSize="9"
                  fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                  style={{ userSelect: 'none' }}
                >
                  {BID_PRICES[i]}
                </text>
              )}
              {/* Winner badge */}
              {isWinner && (
                <text
                  x={XS[i]} y={PROV_CY - NH / 2 - 8}
                  textAnchor="middle"
                  fill="#4ade80" fontSize="9"
                  fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                  style={{ userSelect: 'none' }}
                >
                  ✓ LEASED
                </text>
              )}
            </g>
          );
        })}

        {/* ── Tenant nodes ─────────────────────────────────────────────────── */}
        {TENT_LABELS.map((label, i) => {
          const isActive    = phase !== 'idle' && i === selTenant;
          const isDimmed    = !isLease && selTenant !== null && phase !== 'idle' && i !== selTenant;
          const isLeasedTen = isLease && i === selTenant;
          const canClick    = phase === 'idle' || phase === 'lease';

          return (
            <g key={i} onClick={() => handleTenantClick(i)} style={{ cursor: canClick ? 'pointer' : 'default' }}>
              {isActive && (
                <rect
                  x={XS[i] - NW / 2 - 3} y={TENT_CY - NH / 2 - 3}
                  width={NW + 6} height={NH + 6} rx={NR + 2}
                  fill="none"
                  stroke={isLeasedTen ? '#4ade80' : '#00d4aa'}
                  strokeWidth="1.5"
                  filter="url(#ak-glow-xs)"
                  opacity={isLeasedTen ? 1 : 0.7}
                />
              )}
              <rect
                x={XS[i] - NW / 2} y={TENT_CY - NH / 2}
                width={NW} height={NH} rx={NR}
                fill={isActive ? '#0a1918' : isDimmed ? '#090909' : '#111120'}
                stroke={isActive ? (isLeasedTen ? '#4ade80' : '#00b48a') : isDimmed ? '#141414' : '#1c1c30'}
                strokeWidth="1"
                style={{ transition: 'fill 0.3s, stroke 0.3s' }}
              />
              <text
                x={XS[i]} y={TENT_CY + 4}
                textAnchor="middle"
                fill={isActive ? '#e5e7eb' : isDimmed ? '#222' : '#6b7280'}
                fontSize="10.5"
                fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                style={{ transition: 'fill 0.3s', userSelect: 'none' }}
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* ── Tier labels ──────────────────────────────────────────────────── */}
        <text x={MKT_X1 + 4} y={PROV_CY - NH / 2 - 16}
          fill="#2d3748" fontSize="8.5" letterSpacing="1.8"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          style={{ userSelect: 'none' }}
        >
          PROVIDERS — KUBERNETES CLUSTERS
        </text>
        <text x={MKT_X1 + 4} y={TENT_CY + NH / 2 + 18}
          fill="#2d3748" fontSize="8.5" letterSpacing="1.8"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          style={{ userSelect: 'none' }}
        >
          TENANTS — CONTAINER DEPLOYMENTS
        </text>
      </svg>

      {/* Status bar */}
      <div className="border-t border-gray-800/60 bg-[#0c0c18] px-4 py-2.5">
        <p
          className="font-mono text-[11px] transition-colors duration-300"
          style={{
            color: isLease ? '#4ade80' : isBids ? '#f59e0b' : phase === 'auction' ? '#60a5fa' : '#374151',
          }}
        >
          {STATUS[phase]}
        </p>
      </div>
    </div>
  );
}
