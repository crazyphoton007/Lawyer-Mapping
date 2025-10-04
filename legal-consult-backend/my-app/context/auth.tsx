import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import * as SecureStore from "expo-secure-store";

type User = { id: string; phone: string } | null;
type Ctx = {
  user: User;
  token: string | null;
  hydrated: boolean;                      // 👈 NEW
  setAuth: (t: string, u: User) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthCtx = createContext<Ctx>({
  user: null,
  token: null,
  hydrated: false,                         //  NEW
  setAuth: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User>(null);
  const [hydrated, setHydrated] = useState(false);   // 👈 NEW

  useEffect(() => {
    (async () => {
      try {
        const t = await SecureStore.getItemAsync("token");
        const u = await SecureStore.getItemAsync("user");
        if (t && u) {
          setToken(t);
          setUser(JSON.parse(u));
        }
      } finally {
        setHydrated(true);                 //  done loading from storage
      }
    })();
  }, []);

  const setAuth = async (t: string, u: User) => {
    setToken(t);
    setUser(u);
    await SecureStore.setItemAsync("token", t);
    await SecureStore.setItemAsync("user", JSON.stringify(u));
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("user");
  };

  return (
    <AuthCtx.Provider value={{ token, user, hydrated, setAuth, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
