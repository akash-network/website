import { useEffect, useRef, useState } from "react";

interface Props {
  rawUrl: string;
}

const AiActionsDropdown = ({ rawUrl }: Props) => {
  const [open, setOpen] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copy page");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      return true;
    } catch (e) {
      console.error("Copy failed:", e);
      return false;
    }
  };

  const fetchMarkdown = async () => {
    const res = await fetch(rawUrl);
    return res.text();
  };

  const handleCopy = async () => {
    setOpen(false);
    try {
      const text = await fetchMarkdown();
      const ok = await copyToClipboard(text);
      setCopyLabel(ok ? "Copied!" : "Failed");
    } catch (e) {
      setCopyLabel("Failed");
    }
    setTimeout(() => setCopyLabel("Copy page"), 2000);
  };

  const handleAkashChat = async () => {
    setOpen(false);
    try {
      const text = await fetchMarkdown();
      await copyToClipboard(text);
    } catch (e) {}
    window.open("https://chat.akash.network", "_blank");
  };

  const prompt = encodeURIComponent(
    `Here is an Akash Network documentation page in Markdown: ${rawUrl}\n\nPlease read it and answer my questions about it.`,
  );

  const actions = [
    {
      label: copyLabel,
      description: "Copy page as Markdown for LLMs",
      onClick: handleCopy,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      ),
    },
    {
      label: "Open in AkashChat",
      description: "Copies page then opens AkashChat",
      onClick: handleAkashChat,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      ),
    },
    {
      label: "Open in ChatGPT",
      description: "Ask questions about this page",
      href: `https://chatgpt.com/?q=${prompt}`,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.28 9.28a5.998 5.998 0 0 0-.52-4.93 6.07 6.07 0 0 0-6.53-2.91A6.01 6.01 0 0 0 10.71 0a6.07 6.07 0 0 0-5.78 4.2 6.01 6.01 0 0 0-4 2.91 6.07 6.07 0 0 0 .75 7.12 6 6 0 0 0 .52 4.93 6.07 6.07 0 0 0 6.53 2.91A6.01 6.01 0 0 0 13.29 24a6.07 6.07 0 0 0 5.78-4.2 6.01 6.01 0 0 0 4-2.91 6.07 6.07 0 0 0-.75-7.61zM13.29 22.5a4.5 4.5 0 0 1-2.89-1.05l.14-.08 4.79-2.77a.79.79 0 0 0 .4-.69v-6.77l2.03 1.17a.07.07 0 0 1 .04.06v5.6a4.52 4.52 0 0 1-4.51 4.53zm-9.69-4.14a4.5 4.5 0 0 1-.54-3.02l.14.09 4.79 2.77a.78.78 0 0 0 .79 0l5.85-3.38v2.34a.08.08 0 0 1-.03.06L9.74 20.5a4.52 4.52 0 0 1-6.14-2.14zm-1.26-10.5a4.5 4.5 0 0 1 2.34-1.98v5.72a.77.77 0 0 0 .39.68l5.84 3.37-2.03 1.17a.08.08 0 0 1-.07 0L4.05 14.3a4.52 4.52 0 0 1-.71-6.44zm16.67 3.87-5.85-3.38 2.03-1.17a.08.08 0 0 1 .08 0l4.74 2.74a4.5 4.5 0 0 1-.7 8.12V12.4a.79.79 0 0 0-.3-.67zm2.02-3.03-.15-.09-4.78-2.78a.79.79 0 0 0-.79 0L9.47 9.71V7.37a.07.07 0 0 1 .03-.06l4.74-2.73a4.51 4.51 0 0 1 6.79 4.62zm-12.7 4.18-2.03-1.17a.08.08 0 0 1-.04-.06V6.05a4.51 4.51 0 0 1 7.4-3.46l-.14.08-4.79 2.77a.79.79 0 0 0-.4.69zm1.1-2.37 2.6-1.5 2.6 1.5v3l-2.6 1.5-2.6-1.5z"/>
        </svg>
      ),
    },
    {
      label: "Open in Claude",
      description: "Ask questions about this page",
      href: `https://claude.ai/new?q=${prompt}`,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-1.89-.122-.314-.048v-.172l.287-.164 1.937-.122 2.34-.097 2.697-.073.79-.05h.23l.048-.14-.048-.199-.08-.217-4.72-2.647-.824-.461-.343-.24-.24-.415.12-.421.394-.287.514.072.766.368 4.604 2.311.766.415.19.048.048-.048-.048-.19-.415-.766L7.255 6.57l-.9-1.72-.361-.838-.072-.746.42-.448.523.024.313.283.603.918 1.122 1.84 2.311 4.605.414.766.134.19.066-.066v-.151l.42-4.81.122-1.937.098-1.018.073-.668.166-.283.337-.134.389.134.2.337-.024.668-.049 1.018-.097 1.937-.415 4.81v.237l.066.066.151-.066.766-.414 4.604-2.311.766-.368.515-.072.393.287.12.42-.239.415-.343.241-.824.461-4.72 2.647-.217.08-.048.2.048.139h.23l.79.049 2.697.073 2.34.097 1.936.122.288.164v.172l-.314.048-1.89.122-2.34.097-2.697.073-.79.048h-.23l-.08.128.08.23 4.72 2.647.824.461.344.241.24.415-.12.42-.394.288-.514-.072-.766-.368-4.604-2.311-.766-.415-.19-.048-.066.066.066.15.415.767 2.311 4.604.36.838.073.746-.42.448-.524-.024-.313-.283-.603-.918-1.122-1.84-2.311-4.604-.414-.766-.134-.19h-.066l-.066.066v.151l-.42 4.81-.097 1.937-.122 1.018-.073.668-.166.283-.337.134-.389-.134-.2-.337.024-.668.049-1.018.097-1.937.415-4.81v-.151l-.066-.066-.151.066-.766.415-4.604 2.311-.766.368-.515.072-.393-.288-.12-.42.24-.415.342-.241.824-.461z"/>
        </svg>
      ),
    },
  ];

  return (
    <div ref={ref} className="relative mt-3 mb-1">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-1.5 rounded-md border border-[#e6e8eb] px-3 py-1.5 text-xs text-para hover:text-primary hover:border-primary transition-colors dark:border-[#333]"
      >
        <span className="flex items-center gap-1.5">
          <svg width="13" height="13" viewBox="0 0 208 128" fill="currentColor">
            <path d="M30 98V30h20l20 25 20-25h20v68H90V59L70 84 50 59v39H30zm125 0l-30-33h20V30h20v35h20L145 98z"/>
          </svg>
          Copy page
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border border-[#e6e8eb] bg-background shadow-lg dark:border-[#333]">
          {actions.map((action) =>
            action.onClick ? (
              <button
                key={action.label}
                onClick={action.onClick}
                className="flex w-full items-start gap-3 px-3 py-2.5 text-left hover:bg-[#f6f6f6] dark:hover:bg-[#1a1a1a] transition-colors"
              >
                <span className="mt-0.5 shrink-0 text-para">{action.icon}</span>
                <span>
                  <p className="text-xs font-medium text-foreground">{action.label}</p>
                  <p className="text-[11px] text-[#808080]">{action.description}</p>
                </span>
              </button>
            ) : (
              
              <a                key={action.label}
                href={action.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex w-full items-start gap-3 px-3 py-2.5 hover:bg-[#f6f6f6] dark:hover:bg-[#1a1a1a] transition-colors"
              >
                <span className="mt-0.5 shrink-0 text-para">{action.icon}</span>
                <span>
                  <p className="text-xs font-medium text-foreground">{action.label}</p>
                  <p className="text-[11px] text-[#808080]">{action.description}</p>
                </span>
              </a>
            ),
          )}
        </div>
      )}
    </div>
  );
};

export default AiActionsDropdown;
