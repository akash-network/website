import React, { useEffect, useState, useRef } from "react";
import { Copy, Check } from "lucide-react";

interface SDLSection {
  id: string;
  title: string;
  startLine: number;
  endLine: number;
}

interface LiveSDLProps {
  code: string;
  sections: SDLSection[];
}

export default function LiveSDL({ code, sections }: LiveSDLProps) {
  const [activeSection, setActiveSection] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [highlightedLines, setHighlightedLines] = useState<Set<number>>(new Set());
  const codeContainerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Listen for scroll events and update active section
  useEffect(() => {
    const handleScroll = () => {
      // Find which section is currently in view
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Check if element is in the top 30% of viewport
          if (rect.top >= 0 && rect.top <= window.innerHeight * 0.3) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    // Use Intersection Observer for better performance
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            const section = sections.find((s) => s.id === sectionId);
            if (section) {
              setActiveSection(section.id);
            }
          }
        });
      },
      {
        rootMargin: "-20% 0px -70% 0px", // Trigger when in top 30% of viewport
      }
    );

    // Observe all section markers
    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [sections]);

  // Update highlighted lines when active section changes
  useEffect(() => {
    const section = sections.find((s) => s.id === activeSection);
    if (section) {
      const lines = new Set<number>();
      for (let i = section.startLine; i <= section.endLine; i++) {
        lines.add(i);
      }
      setHighlightedLines(lines);
    }
  }, [activeSection, sections]);

  // Auto-scroll code panel when active section changes
  useEffect(() => {
    const section = sections.find((s) => s.id === activeSection);
    if (section) {
      const firstLineElement = lineRefs.current.get(section.startLine);
      
      if (firstLineElement) {
        // Find the scrollable parent (the sticky wrapper with overflow-y-auto)
        let scrollableParent = codeContainerRef.current?.parentElement;
        while (scrollableParent) {
          const overflow = window.getComputedStyle(scrollableParent).overflowY;
          if (overflow === 'auto' || overflow === 'scroll') {
            break;
          }
          scrollableParent = scrollableParent.parentElement;
        }
        
        if (scrollableParent) {
          // Calculate the position to scroll to
          const containerTop = scrollableParent.getBoundingClientRect().top;
          const lineTop = firstLineElement.getBoundingClientRect().top;
          const currentScroll = scrollableParent.scrollTop;
          
          // Scroll so the line is near the top (with some padding)
          const targetScroll = currentScroll + (lineTop - containerTop) - 80;
          
          scrollableParent.scrollTo({
            top: targetScroll,
            behavior: "smooth"
          });
        }
      }
    }
  }, [activeSection, sections]);

  // Copy code to clipboard
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Split code into lines
  const lines = code.split("\n");

  // Simple YAML syntax highlighting
  const highlightYAML = (line: string) => {
    // Comments
    if (line.trim().startsWith("#")) {
      return <span className="text-green-600 dark:text-green-400">{line}</span>;
    }
    
    // Keys (before colon)
    const keyMatch = line.match(/^(\s*)([a-zA-Z_][\w-]*)(\s*):/);
    if (keyMatch) {
      const [, indent, key, space] = keyMatch;
      const rest = line.substring(keyMatch[0].length);
      return (
        <>
          {indent}
          <span className="text-blue-600 dark:text-blue-400 font-medium">{key}</span>
          {space}:
          {rest}
        </>
      );
    }
    
    // Values (strings, numbers)
    const valueMatch = line.match(/^(\s*-\s+|\s+)(.+)$/);
    if (valueMatch) {
      const [, prefix, value] = valueMatch;
      return (
        <>
          {prefix}
          <span className="text-orange-600 dark:text-orange-400">{value}</span>
        </>
      );
    }
    
    return <span>{line}</span>;
  };

  return (
    <div className="rounded-lg border border-border bg-background shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-background2 px-4 py-2">
        <span className="text-sm font-semibold text-foreground">
          Complete SDL Example
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-para transition-colors hover:bg-background hover:text-foreground"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <div 
        ref={codeContainerRef}
        className="overflow-x-auto bg-background"
      >
        <pre className="p-4 text-xs font-mono leading-relaxed">
          <code className="language-yaml">
            {lines.map((line, index) => {
              const lineNumber = index + 1;
              const isHighlighted = highlightedLines.has(lineNumber);
              
              return (
                <div
                  key={lineNumber}
                  ref={(el) => {
                    if (el) {
                      lineRefs.current.set(lineNumber, el);
                    }
                  }}
                  className={`transition-colors duration-200 ${
                    isHighlighted
                      ? "bg-primary/10 border-l-2 border-primary -ml-2 pl-2"
                      : ""
                  }`}
                >
                  <span className="text-para/40 mr-4 inline-block w-6 text-right select-none">
                    {lineNumber}
                  </span>
                  <span className={isHighlighted ? "font-medium" : "text-foreground/80"}>
                    {highlightYAML(line)}
                  </span>
                </div>
              );
            })}
          </code>
        </pre>
      </div>

      {/* Active section indicator */}
      {activeSection && (
        <div className="border-t border-border bg-background2 px-4 py-2">
          <span className="text-xs text-para">
            Viewing:{" "}
            <span className="font-medium text-foreground">
              {sections.find((s) => s.id === activeSection)?.title}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}

