import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
} from "react";
import { useTheme as useThemeState } from "@/hooks/useTheme";

/////////////
// CONTEXT
/////////////

interface ThemeContextType {
  dark: boolean;
  setDark: Dispatch<SetStateAction<boolean>>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/////////////
// HELPER
/////////////

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};

/////////////
// PROVIDER
/////////////

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [dark, setDark] = useThemeState();

  return (
    <ThemeContext.Provider value={{ dark, setDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
