import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "token";
const USER_KEY = "user";
const GUEST_TOKEN_KEY = "guest_token";
const GUEST_USER_KEY = "guest_user";
const USER_MOBILE_KEY = "user_mobile";

type User = {
  id: string;
  phone?: string | null;
  name?: string | null;
  role?: string | null;
  is_guest?: boolean;
} | null;
type Ctx = {
  user: User;
  token: string | null;
  hydrated: boolean;
  setAuth: (t: string, u: User) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthCtx = createContext<Ctx>({
  user: null,
  token: null,
  hydrated: false,
  setAuth: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const t = await SecureStore.getItemAsync(TOKEN_KEY);
        const u = await SecureStore.getItemAsync(USER_KEY);
        if (t && u) {
          setToken(t);
          setUser(JSON.parse(u));
        }
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  const setAuth = async (t: string, u: User) => {
    const explicitlyNonGuest =
      !!u && (u.is_guest === false || (!!u.role && u.role !== "guest"));
    const resolvedUser =
      u &&
      !explicitlyNonGuest &&
      (u.is_guest || u.role === "guest" || user?.is_guest || user?.role === "guest")
        ? {
            ...u,
            role: u.role ?? user?.role ?? "guest",
            is_guest: true,
          }
        : u;

    setToken(t);
    setUser(resolvedUser);
    await SecureStore.setItemAsync(TOKEN_KEY, t);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(resolvedUser));

    if (resolvedUser?.is_guest || resolvedUser?.role === "guest") {
      await SecureStore.setItemAsync(GUEST_TOKEN_KEY, t);
      await SecureStore.setItemAsync(GUEST_USER_KEY, JSON.stringify(resolvedUser));
    } else {
      await SecureStore.deleteItemAsync(GUEST_TOKEN_KEY);
      await SecureStore.deleteItemAsync(GUEST_USER_KEY);
    }
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
      SecureStore.deleteItemAsync(GUEST_TOKEN_KEY),
      SecureStore.deleteItemAsync(GUEST_USER_KEY),
      SecureStore.deleteItemAsync(USER_MOBILE_KEY),
    ]);
  };

  return (
    <AuthCtx.Provider value={{ token, user, hydrated, setAuth, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
