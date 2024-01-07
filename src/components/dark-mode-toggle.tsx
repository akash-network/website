import React, { useState, useEffect } from "react";
import { Sun, SunMoon } from "lucide-react";

const DarkModeToggle = () => {
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
    <button onClick={toggleTheme} id="header-toggle">
      <Sun className="h-5 w-5 text-para dark:hidden" />
      <SunMoon className="hidden h-5 w-5 text-para dark:block" />
    </button>
  );
};

export default DarkModeToggle;
