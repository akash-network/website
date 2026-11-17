import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type ThemeOption = "light" | "dark" | "system";

const THEME_OPTIONS = [
  { key: "light", label: "Light", Icon: Sun },
  { key: "dark", label: "Dark", Icon: Moon },
  { key: "system", label: "System", Icon: Monitor },
] as const;

// "System" is stored as the absence of a saved theme — the base layout then
// follows `prefers-color-scheme`.
function readThemeOption(): ThemeOption {
  try {
    const saved = localStorage.getItem("theme");
    return saved === "light" || saved === "dark" ? saved : "system";
  } catch {
    return "system";
  }
}

function applyThemeOption(option: ThemeOption) {
  const isDark =
    option === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : option === "dark";

  // Persist first: the mermaid observer in the base layout re-reads the saved
  // theme when the <html> class changes.
  try {
    if (option === "system") localStorage.removeItem("theme");
    else localStorage.setItem("theme", option);
  } catch {}

  const root = document.documentElement;
  root.classList.toggle("dark", isDark);
  root.setAttribute("data-theme", isDark ? "dark-plus" : "light-plus");
}

export default function ThemeToggleGroup() {
  const [selected, setSelected] = useState<ThemeOption>();

  useEffect(() => {
    setSelected(readThemeOption());
  }, []);

  const select = (option: ThemeOption) => {
    applyThemeOption(option);
    setSelected(option);
  };

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-zinc-200 p-0.5 dark:border-white/10">
      {THEME_OPTIONS.map(({ key, label, Icon }) => {
        const isActive = selected === key;
        return (
          <button
            key={key}
            type="button"
            aria-label={label}
            aria-pressed={isActive}
            onClick={() => select(key)}
            className={cn(
              "inline-flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20",
              isActive && "bg-accent text-foreground",
            )}
          >
            <Icon className="size-3.5" />
          </button>
        );
      })}
    </div>
  );
}
