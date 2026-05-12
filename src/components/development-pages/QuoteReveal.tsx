import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  lines: string[];
  author: string;
  authorDetails?: string[];
  href?: string;
  outlined?: boolean;
  preRevealChars?: number;
  startProgress?: number;
}

const blockStyle: React.CSSProperties = {
  fontFamily: "Inter, sans-serif",
  fontWeight: 500,
  fontSize: "28px",
  lineHeight: "33.6px",
  letterSpacing: "-1.1px",
  width: "100%",
  textAlign: "center",
};

export default function QuoteReveal({ lines, author, authorDetails, href, outlined, preRevealChars, startProgress = 0 }: Props) {
  const [progress, setProgress] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const raw = (vh - rect.top) / (vh * 0.75);
      setProgress(Math.max(startProgress, Math.min(1, raw)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [startProgress]);

  let globalIdx = 0;
  const charGroups = lines.map((line) => {
    if (!line) return { chars: [] as string[], globalStart: -1 };
    const chars = line.split("");
    const globalStart = globalIdx;
    globalIdx += chars.length;
    return { chars, globalStart };
  });
  const totalChars = globalIdx;
  const preRevealed = preRevealChars ?? (charGroups[0]?.chars.length ?? 0);
  const revealedCount = preRevealed + Math.round(progress * (totalChars - preRevealed));

  const renderBlockquote = () => (
    <blockquote style={blockStyle} className="text-foreground">
      {charGroups.map((group, gi) => (
        <span key={gi} style={{ display: "block", minHeight: group.chars.length ? undefined : "0.6em" }}>
          {group.chars.map((char, ci) => {
            const revealed = group.globalStart + ci < revealedCount;
            return (
              <span key={ci} style={{ opacity: revealed ? 1 : 0.2 }}>
                {char}
              </span>
            );
          })}
        </span>
      ))}
    </blockquote>
  );

  const authorThreshold = startProgress + (1 - startProgress) * 0.82;
  const renderAuthor = () => (
    <div
      className="mt-8 space-y-1"
      style={{ opacity: progress >= authorThreshold ? 1 : 0, transition: "opacity 0.5s ease" }}
    >
      <p className="font-semibold text-foreground" style={{ fontFamily: "Inter, sans-serif", letterSpacing: "3px" }}>
        {author}
      </p>
      {authorDetails?.map((d, i) => (
        <p key={i} className="text-sm font-normal text-para">{d}</p>
      ))}
    </div>
  );

  if (outlined) {
    return (
      <div ref={ref} className="w-full">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="group block w-full rounded-xl border px-8 py-14 text-center"
        >
          <div className="mb-8 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <ArrowUpRight size={22} className="text-foreground" />
          </div>
          <div className="mx-auto max-w-3xl">
            {renderBlockquote()}
          </div>
          {renderAuthor()}
        </a>
      </div>
    );
  }

  return (
    <div ref={ref} className="mx-auto w-full max-w-3xl text-center">
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="block w-full transition-opacity hover:opacity-80">
          {renderBlockquote()}
        </a>
      ) : renderBlockquote()}
      {renderAuthor()}
    </div>
  );
}
