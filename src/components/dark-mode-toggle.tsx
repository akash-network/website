import { Sun, SunMoon } from "lucide-react";
import { useEffect, useState } from "react";

const DarkModeToggle = ({ footer }: { footer?: boolean }) => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // With no saved theme the site follows the OS preference ("System").
    const localTheme = window.localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    setTheme(localTheme ?? (prefersDark ? "dark" : "light"));
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      window.localStorage.setItem("theme", "dark");
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      window.localStorage.setItem("theme", "light");
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      id={footer ? "header-toggle-footer" : "header-toggle"}
      aria-label="Toggle dark mode"
    >
      <Sun className="h-5 w-5 text-para hover:text-primary dark:hidden" />
      <SunMoon className="hidden h-5 w-5 text-para hover:text-primary dark:block" />
    </button>
  );
};

export default DarkModeToggle;
