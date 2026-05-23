import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

type LanguageKey =
  | "bash"
  | "javascript"
  | "python"
  | "go"
  | "ruby"
  | "php";

interface LanguageGroup {
  label: string;
  languages: LanguageKey[];
}

interface SectionLite {
  id: string;
  title: string;
}

interface ApiReferencePanelProps {
  sections: SectionLite[];
  htmlByLanguage: Partial<Record<LanguageKey, string>>;
  rawByLanguage: Partial<Record<LanguageKey, string>>;
  rawBySectionAndLanguage: Record<string, Partial<Record<LanguageKey, string>>>;
  availableLanguages: LanguageKey[];
  languageGroups: LanguageGroup[];
  languageLabels: Record<LanguageKey, string>;
}

const LANGUAGE_STORAGE_KEY = "akash-docs-preferred-language";
const LANGUAGE_CHANGE_EVENT = "akash-language-change";

export default function ApiReferencePanel({
  sections,
  htmlByLanguage,
  rawByLanguage,
  rawBySectionAndLanguage,
  availableLanguages,
  languageGroups,
  languageLabels,
}: ApiReferencePanelProps) {
  // IMPORTANT: SSR and the initial client render MUST agree — otherwise React
  // emits a hydration mismatch and the first click on a language tab can be
  // dropped. We always start with availableLanguages[0] and then upgrade from
  // localStorage in a mount-time effect.
  const [activeLanguage, setActiveLanguage] = useState<LanguageKey>(
    availableLanguages[0] ?? "bash",
  );
  const [activeSectionId, setActiveSectionId] = useState<string | null>(
    sections[0]?.id ?? null,
  );
  const [copied, setCopied] = useState(false);
  const codeScrollRef = useRef<HTMLDivElement | null>(null);
  const programmaticScrollUntilRef = useRef<number>(0);

  // After mount: pull the user's persisted preference (if any) and adopt it.
  useEffect(() => {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY) as
      | LanguageKey
      | null;
    if (saved && availableLanguages.includes(saved) && saved !== activeLanguage) {
      setActiveLanguage(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync with cross-page CustomEvent so picks on other pages persist here.
  useEffect(() => {
    function onLanguageChange(event: Event) {
      const detail = (event as CustomEvent<{ language: LanguageKey }>).detail;
      if (detail?.language && availableLanguages.includes(detail.language)) {
        setActiveLanguage(detail.language);
      }
    }
    window.addEventListener(LANGUAGE_CHANGE_EVENT, onLanguageChange);
    return () =>
      window.removeEventListener(LANGUAGE_CHANGE_EVENT, onLanguageChange);
  }, [availableLanguages]);

  // IntersectionObserver on prose sections — updates active section.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-section-id]"),
    );
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              (a.target as HTMLElement).getBoundingClientRect().top -
              (b.target as HTMLElement).getBoundingClientRect().top,
          );
        if (visible.length > 0) {
          const id = (visible[0].target as HTMLElement).dataset.sectionId;
          if (id) setActiveSectionId(id);
        }
      },
      {
        rootMargin: "-100px 0% -66% 0%",
        threshold: 0,
      },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // When the active section changes, scroll the code pane to its marker and
  // toggle the `data-active` attribute so CSS can highlight the active block.
  useEffect(() => {
    if (!activeSectionId || !codeScrollRef.current) return;
    const container = codeScrollRef.current;
    container
      .querySelectorAll<HTMLElement>("[data-section-marker]")
      .forEach((el) => {
        if (el.dataset.sectionMarker === activeSectionId) {
          el.setAttribute("data-active", "true");
        } else {
          el.removeAttribute("data-active");
        }
      });
    const marker = container.querySelector<HTMLElement>(
      `[data-section-marker="${CSS.escape(activeSectionId)}"]`,
    );
    if (!marker) return;
    const containerTop = container.getBoundingClientRect().top;
    const markerTop = marker.getBoundingClientRect().top;
    const target = container.scrollTop + (markerTop - containerTop) - 8;
    programmaticScrollUntilRef.current = Date.now() + 800;
    container.scrollTo({ top: target, behavior: "smooth" });
  }, [activeSectionId, activeLanguage]);

  // Click delegation for per-section copy buttons rendered inside the
   // pre-built HTML (one per .api-section-block). Looks up raw code by
   // section id + active language; toggles data-copied on the button.
  useEffect(() => {
    const container = codeScrollRef.current;
    if (!container) return;
    function onClick(event: MouseEvent) {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(
        "[data-copy-section]",
      );
      if (!target) return;
      event.stopPropagation();
      const sectionId = target.dataset.copySection;
      if (!sectionId) return;
      const code = rawBySectionAndLanguage[sectionId]?.[activeLanguage] ?? "";
      if (!code) return;
      navigator.clipboard
        .writeText(code)
        .then(() => {
          target.setAttribute("data-copied", "true");
          const label = target.querySelector("span");
          const previous = label?.textContent ?? "Copy";
          if (label) label.textContent = "Copied";
          setTimeout(() => {
            target.removeAttribute("data-copied");
            if (label) label.textContent = previous;
          }, 1500);
        })
        .catch(() => {
          // ignore — older browsers without clipboard permission
        });
    }
    container.addEventListener("click", onClick);
    return () => container.removeEventListener("click", onClick);
  }, [activeLanguage, rawBySectionAndLanguage]);

  function handleLanguageChange(language: LanguageKey) {
    if (!availableLanguages.includes(language)) return;
    setActiveLanguage(language);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      window.dispatchEvent(
        new CustomEvent(LANGUAGE_CHANGE_EVENT, { detail: { language } }),
      );
    }
  }

  async function handleCopy() {
    const raw = rawByLanguage[activeLanguage] ?? "";
    if (!raw) return;
    try {
      await navigator.clipboard.writeText(raw);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore — older browsers without clipboard permission
    }
  }

  const activeHtml = htmlByLanguage[activeLanguage] ?? "";

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#f6f8fa] text-[#1f2328] dark:bg-[#0d1117] dark:text-[#e6edf3]">
      {/* Switcher rows */}
      <div className="border-b border-black/10 bg-[#eef0f3] px-4 py-3 text-xs dark:border-white/10 dark:bg-[#161b22]">
        {languageGroups.map((group) => (
          <div
            key={group.label}
            className="flex items-center gap-3 py-1 first:pt-0 last:pb-0"
          >
            <span className="w-14 shrink-0 font-mono text-[10px] font-semibold uppercase tracking-widest text-black/45 dark:text-white/50">
              {group.label}
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {group.languages.map((language) => {
                const isAvailable = availableLanguages.includes(language);
                const isActive = activeLanguage === language;
                return (
                  <button
                    key={language}
                    type="button"
                    onClick={() => handleLanguageChange(language)}
                    disabled={!isAvailable}
                    title={
                      isAvailable
                        ? languageLabels[language]
                        : `${languageLabels[language]} — coming soon`
                    }
                    className={[
                      "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                      isActive
                        ? "bg-white text-[#0d1117] shadow-sm dark:bg-white dark:text-[#0d1117]"
                        : isAvailable
                          ? "text-black/65 hover:bg-black/5 hover:text-black dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
                          : "cursor-not-allowed text-black/30 dark:text-white/30",
                    ].join(" ")}
                    aria-pressed={isActive}
                  >
                    {languageLabels[language]}
                  </button>
                );
              })}
            </div>
            {group.label === "SERVER" && (
              <button
                type="button"
                onClick={handleCopy}
                className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-black/55 transition-colors hover:bg-black/5 hover:text-black dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
                title="Copy active language code"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">
                  {copied ? "Copied" : "Copy"}
                </span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Code body — flex-1 fills remaining height inside the fixed aside */}
      <div
        ref={codeScrollRef}
        className="api-reference-code min-h-0 flex-1 overflow-y-auto"
      >
        <div
          className="api-reference-html"
          dangerouslySetInnerHTML={{ __html: activeHtml }}
        />
      </div>
    </div>
  );
}
