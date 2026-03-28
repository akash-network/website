

'use client'

import { useState, useEffect, useRef } from 'react'

export default function Deployments({ projects }: { projects: any[] }) {
  const [visibleCount, setVisibleCount] = useState(3)
  const [isDesktop, setIsDesktop] = useState(false)
  const lastBreakpoint = useRef<string>('')

  useEffect(() => {
    const checkBreaks = () => {
      const width = window.innerWidth
      setIsDesktop(width >= 1024)
      
      let currentBreakpoint = 'sm'
      if (width >= 1024) currentBreakpoint = 'lg'
      else if (width >= 768) currentBreakpoint = 'md'

      if (currentBreakpoint !== lastBreakpoint.current) {
        lastBreakpoint.current = currentBreakpoint
        if (width >= 1024) {
          setVisibleCount(6)
        } else if (width >= 768) {
          setVisibleCount(4)
        } else {
          setVisibleCount(3)
        }
      }
    }
    
    checkBreaks()
    window.addEventListener('resize', checkBreaks)
    return () => window.removeEventListener('resize', checkBreaks)
  }, [])

  const visibleProjects = projects.slice(0, visibleCount);
  const hasMore = visibleCount < 6 && visibleCount < projects.length;
  const showViewAll = visibleCount >= 6 || visibleCount >= projects.length;

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleProjects.map((project, i) => (
          <Card key={i} project={project} />
        ))}
      </div>

      <div className="flex justify-center pb-20">
        {hasMore ? (
          <button
            onClick={() => setVisibleCount((p) => Math.min(p + (window.innerWidth >= 768 ? 2 : 3), 6))}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-transparent dark:bg-white/5 hover:bg-black/5 hover:dark:bg-white/15 border border-black/10 dark:border-white/15 rounded-[40px] text-black dark:text-[#FAFAFA] text-[13px] md:text-base font-medium transition-all active:scale-95 group"
          >
            <span>Show More</span>
            <svg 
              className="w-4 h-4 md:w-5 md:h-5 shrink-0 translate-y-px"
              viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        ) : showViewAll && (
          <a
            href="/ecosystem/deployed-on-akash/"
            className="px-5 py-2 text-sm rounded-full border border-[#E4E4E7] dark:border-white/20 bg-[#F5F5F5] dark:bg-white/5 hover:bg-[#eeeeee] hover:dark:bg-white/10 transition flex gap-2 items-center justify-center group"
          >
            <span>View More Projects</span>
            <svg className="shrink-0 translate-y-px transition-transform duration-300 group-hover:-rotate-45" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.33398 8.00016H12.6673M12.6673 8.00016L8.00065 3.3335M12.6673 8.00016L8.00065 12.6668" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}

/* ---------- CARD ---------- */

function Card({ project }: { project: any }) {
  const [isLoaded, setIsLoaded] = useState(false);

  const cardContent = (
    <div className="rounded-[20px] border border-[#E4E4E7] dark:border-[#2C2C2E] bg-[#F5F5F7] dark:bg-[#181819] p-4 h-full transition-all duration-300 hover:shadow-md dark:hover:bg-[#1c1c1d]">

      <div className="rounded-[14px] overflow-hidden mb-4 bg-black/5 dark:bg-white/5 relative aspect-[16/10]">
        {!isLoaded && (
          <div className="absolute inset-0 bg-black/5 dark:bg-white/5 animate-pulse" />
        )}
        <img
          src={project.data.projectImage.src}
          alt={project.data.projectTitle}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
          className={`w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>

      <h3 className="text-base md:text-lg font-semibold mt-6 text-[#11181C] dark:text-white">
        {project.data.projectTitle}
      </h3>

      <p className="text-xs md:text-sm text-[#7E868C] mt-4 line-clamp-2">
        {project.data.description}
      </p>

      {/* {project.data.websiteLink && (
        <a
          href={project.data.websiteLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex gap-2 items-center justify-center text-xs px-3 py-2 font-medium rounded-full text-[#171717] bg-white hover:brightness-110 transition-all duration-300 cursor-pointer"
        >
          View More 
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.66602 4.6665H11.3327M11.3327 4.6665V11.3332M11.3327 4.6665L4.66602 11.3332" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>

        </a>
      )} */}
    </div>
  );

  if (project.data.websiteLink) {
    return (
      <a 
        href={project.data.websiteLink} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="block h-full group"
      >
        {cardContent}
      </a>
    );
  }

  return cardContent;
}