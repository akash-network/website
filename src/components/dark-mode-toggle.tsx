import { Sun, SunMoon } from "lucide-react";
import { useEffect, useState } from "react";

const DarkModeToggle = ({ footer }: { footer?: boolean }) => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const localTheme = window.localStorage.getItem("theme");
    localTheme && setTheme(localTheme);
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
    >
      <Sun className="h-5 w-5 text-para hover:text-primary dark:hidden" />
      <SunMoon className="hidden h-5 w-5 text-para hover:text-primary dark:block" />
    </button>
  );
};

export default DarkModeToggle;
