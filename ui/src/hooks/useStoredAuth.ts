import { useEffect, useState } from "react";
import type { User } from "@/types";
import {
  startLogin,
  doLogout,
  getUserFromStoredToken,
} from "@/services/cognito";

export function useStoredAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isLoggedIn = !!user;

  useEffect(() => {
    const storedUser = getUserFromStoredToken();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = () => {
    startLogin();
  };

  const logout = () => {
    setUser(null);
    doLogout();
  };

  return { user, isLoggedIn, setUser, login, logout, loading };
}
