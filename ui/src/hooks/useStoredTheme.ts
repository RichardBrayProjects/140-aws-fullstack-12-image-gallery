import { useEffect, useState } from "react";

function getInitialValue() {
  return localStorage.getItem("theme") === "dark";
}

export function useStoredTheme() {
  const [dark, setDark] = useState(getInitialValue);

  useEffect(() => {
    localStorage.setItem("theme", dark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return [dark, setDark] as const;
}
