import React, { useEffect, useState } from "react";
import { Copy, Check } from "lucide-react";

// Language configuration
const LANGUAGES = {
  python: { name: "Python", icon: "🐍" },
  javascript: { name: "JavaScript", icon: "📦" },
  typescript: { name: "TypeScript", icon: "📘" },
  go: { name: "Go", icon: "🔷" },
  bash: { name: "Bash", icon: "💻" },
  yaml: { name: "YAML", icon: "📄" },
  rust: { name: "Rust", icon: "🦀" },
} as const;

type LanguageKey = keyof typeof LANGUAGES;

interface CodeExample {
  language: LanguageKey;
  code: string;
  label?: string;
}

interface CodeTabsProps {
  examples?: CodeExample[];
  children?: React.ReactNode;
  title?: string;
  defaultLanguage?: LanguageKey;
  showLineNumbers?: boolean;
}

export default function CodeTabs({
  examples: providedExamples,
  children,
  title,
  defaultLanguage,
  showLineNumbers = false,
}: CodeTabsProps) {
  // Parse examples from children if not provided as prop
  const examples = React.useMemo(() => {
    if (providedExamples) return providedExamples;
    
    // Parse MDX children to extract code blocks
    const parsed: CodeExample[] = [];
    React.Children.forEach(children, (child: any) => {
      if (child?.props?.className?.includes('language-')) {
        const match = child.props.className.match(/language-(\w+)/);
        const language = match ? match[1] as LanguageKey : 'bash';
        const code = child.props.children || '';
        const label = child.props['data-tab'] || child.props.tab;
        
        parsed.push({ language, code, label });
      }
    });
    
    return parsed.length > 0 ? parsed : [{ language: 'bash' as LanguageKey, code: '', label: undefined }];
  }, [providedExamples, children]);
  
  // Load saved language preference from localStorage
  const [activeLanguage, setActiveLanguage] = useState<LanguageKey>(() => {
    if (typeof window === "undefined") return defaultLanguage || examples[0]?.language || 'bash';
    
    const saved = localStorage.getItem("akash-docs-preferred-language");
    const savedLang = saved as LanguageKey;
    
    // Check if saved language exists in current examples
    if (saved && examples.some((ex) => ex.language === savedLang)) {
      return savedLang;
    }
    
    return defaultLanguage || examples[0]?.language || 'bash';
  });

  const [copied, setCopied] = useState(false);

  // Save language preference and broadcast to all CodeTabs on the page
  const handleLanguageChange = (language: LanguageKey) => {
    setActiveLanguage(language);
    localStorage.setItem("akash-docs-preferred-language", language);
    
    // Broadcast to all CodeTabs components
    window.dispatchEvent(
      new CustomEvent("akash-language-change", {
        detail: { language },
      })
    );
  };

  // Listen for language changes from other CodeTabs
  useEffect(() => {
    const handleGlobalLanguageChange = (event: any) => {
      const newLanguage = event.detail.language as LanguageKey;
      // Only update if this CodeTabs has an example in that language
      if (examples.some((ex) => ex.language === newLanguage)) {
        setActiveLanguage(newLanguage);
      }
    };

    window.addEventListener("akash-language-change", handleGlobalLanguageChange);
    return () => {
      window.removeEventListener("akash-language-change", handleGlobalLanguageChange);
    };
  }, [examples]);

  // Copy to clipboard
  const handleCopy = async () => {
    const activeExample = examples.find((ex) => ex.language === activeLanguage);
    if (activeExample) {
      await navigator.clipboard.writeText(activeExample.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const activeExample = examples.find((ex) => ex.language === activeLanguage) || examples[0] || { language: 'bash' as LanguageKey, code: '', label: undefined };

  return (
    <div className="not-prose my-6 overflow-hidden rounded-lg border border-border bg-background">
      {/* Header with tabs and copy button */}
      <div className="flex items-center justify-between border-b border-border bg-background2 px-4">
        {/* Language tabs */}
        <div className="flex gap-1 overflow-x-auto py-2">
          {examples.map((example) => {
            const langConfig = LANGUAGES[example.language];
            const isActive = activeLanguage === example.language;
            
            return (
              <button
                key={example.language}
                onClick={() => handleLanguageChange(example.language)}
                className={`
                  flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-para hover:bg-background hover:text-foreground"
                  }
                `}
                aria-current={isActive ? "page" : undefined}
              >
                <span>{langConfig.icon}</span>
                <span>{example.label || langConfig.name}</span>
              </button>
            );
          })}
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="ml-2 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-para transition-colors hover:bg-background hover:text-foreground"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              <span className="hidden sm:inline">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span className="hidden sm:inline">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Title (optional) */}
      {title && (
        <div className="border-b border-border bg-background2 px-4 py-2 text-sm font-medium text-foreground">
          {title}
        </div>
      )}

      {/* Code content */}
      <div className="relative overflow-x-auto bg-background">
        <pre className="m-0 p-4 text-sm text-foreground">
          <code className="language-{activeExample.language}">
            {activeExample.code}
          </code>
        </pre>
      </div>
    </div>
  );
}

// Helper component for individual code examples
export function CodeExample({
  language,
  code,
  label,
}: {
  language: LanguageKey;
  code: string;
  label?: string;
}) {
  return { language, code, label };
}

