import { useEffect, useState } from 'react'
import type { Provider } from './types'

interface ProviderCardProps {
  provider: Provider
  onClose: () => void
}

export default function ProviderCard({ provider, onClose }: ProviderCardProps) {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const fields = [
    { label: 'Location', value: provider.location },
    { label: 'Uptime', value: provider.uptime },
    { label: 'CPU', value: provider.cpu },
    { label: 'GPUs', value: provider.gpus },
    { label: 'Memory', value: provider.memory },
    { label: 'Leases', value: String(provider.leases) },
  ]

  return (
    <div className="relative w-full max-w-[500px] lg:max-w-[360px]">
      <div className={`w-full bg-[#212123] rounded-xl lg:rounded-[20px] px-6 py-5 relative z-10 transition-colors duration-300`}>
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 z-20 w-8 h-8 hidden lg:flex items-center justify-center rounded-full border border-white/10 text-white bg-white/5 transition-colors duration-300 cursor-pointer"
          aria-label="Close"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </button>

        <div className="flex justify-between items-center mb-1">
          <span className="text-[#86868B] text-xs md:text-sm">Provider:</span>
          {provider.audited ? (
            <span className="bg-[#A6FA99] text-[#0C3205] text-[10px] md:text-xs px-1.5 sm:px-2.5 py-1 rounded-full flex items-center gap-1.5 font-semibold">
              Audited
              <svg className="w-3 md:w-3.5 h-3 md:h-3.5" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_763_1721)">
              <path d="M4.50012 6L5.50012 7L7.50012 5M1.9251 4.31005C1.85212 3.98131 1.86332 3.63947 1.95767 3.31622C2.05203 2.99297 2.22647 2.69877 2.46483 2.46091C2.70319 2.22305 2.99775 2.04922 3.3212 1.95555C3.64465 1.86187 3.98651 1.85138 4.3151 1.92505C4.49595 1.6422 4.7451 1.40943 5.03957 1.24819C5.33405 1.08695 5.66437 1.00244 6.0001 1.00244C6.33582 1.00244 6.66615 1.08695 6.96062 1.24819C7.25509 1.40943 7.50424 1.6422 7.6851 1.92505C8.01418 1.85106 8.35663 1.8615 8.6806 1.95541C9.00456 2.04931 9.29951 2.22362 9.53802 2.46213C9.77653 2.70063 9.95084 2.99559 10.0447 3.31955C10.1386 3.64351 10.1491 3.98596 10.0751 4.31505C10.3579 4.4959 10.5907 4.74505 10.752 5.03952C10.9132 5.334 10.9977 5.66432 10.9977 6.00005C10.9977 6.33577 10.9132 6.6661 10.752 6.96057C10.5907 7.25505 10.3579 7.50419 10.0751 7.68505C10.1488 8.01363 10.1383 8.3555 10.0446 8.67895C9.95092 9.00239 9.7771 9.29695 9.53924 9.53531C9.30137 9.77367 9.00718 9.94812 8.68393 10.0425C8.36067 10.1368 8.01883 10.148 7.6901 10.075C7.50948 10.359 7.26014 10.5928 6.96516 10.7547C6.67018 10.9167 6.33911 11.0016 6.0026 11.0016C5.66608 11.0016 5.33501 10.9167 5.04003 10.7547C4.74506 10.5928 4.49572 10.359 4.3151 10.075C3.98651 10.1487 3.64465 10.1382 3.3212 10.0446C2.99775 9.95088 2.70319 9.77705 2.46483 9.53919C2.22647 9.30133 2.05203 9.00713 1.95767 8.68388C1.86332 8.36063 1.85212 8.01879 1.9251 7.69005C1.64007 7.50967 1.4053 7.26014 1.24262 6.96466C1.07994 6.66918 0.994629 6.33735 0.994629 6.00005C0.994629 5.66275 1.07994 5.33092 1.24262 5.03544C1.4053 4.73996 1.64007 4.49043 1.9251 4.31005Z" stroke="#0C3205" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
              <defs>
              <clipPath id="clip0_763_1721">
              <rect width="12" height="12" fill="white"/>
              </clipPath>
              </defs>
              </svg>
            </span>
          ) : (
            <span className="bg-[#FEF08A] text-[#854D0E] text-[10px] md:text-xs px-1.5 sm:px-2.5 py-1 rounded-full flex items-center font-semibold">
              Pending
            </span>
          )}
        </div>
        <h2 className="text-sm md:text-[19px] text-[#fafafa] md:font-medium mb-6 truncate overflow-hidden whitespace-nowrap transition-colors duration-300" title={provider.id}>
          {provider.name}
        </h2>

        <div className="space-y-2">
          {fields.map((field) => (
            <div key={field.label} className="flex items-center gap-2">
              <span className="w-[70px] md:w-[84px] shrink-0 text-xs md:text-sm font-medium text-[#fafafa]">
                {field.label}
              </span>
              <div className="flex-grow shadow-sm border border-white/15 bg-white/5 rounded-[8px] px-3 md:px-4 py-2 flex items-center h-fit md:h-10 text-xs md:text-sm transition-colors duration-300 text-[#A3A3A3]">
                <span className="truncate">{field.value}</span>
              </div>
            </div>
          ))}
        </div>

        <a
          href={`https://console.akash.network/providers/${provider.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full text-[#fafafa] mt-6 px-4 py-2.5 rounded-full text-[15px] font-semibold transition-all hidden lg:flex items-center justify-center gap-2 cursor-pointer border bg-transparent border-[#4B4B4D] hover:bg-white/5">
          View on Console
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
    </div>
  )
}
 
