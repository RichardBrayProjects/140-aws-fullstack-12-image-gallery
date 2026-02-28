import { createContext, ReactNode, useContext } from "react";
import { useAuth as useAuthState } from "@/hooks/useAuth";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  setUser: (user: User | null) => void;
  login: () => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const value = useAuthState();

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
