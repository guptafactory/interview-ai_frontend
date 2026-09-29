import { useEffect, useState } from "react";
import AuthContext from "../contexts/auth.context.js";
import { getMe } from "../services/auth.api.js";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAndSetUser = async () => {
      try {
        const data = await getMe();
        setUser(data?.user ?? null);
      } catch (error) {
        const status = error.response?.status;

        // 401 just means "no active session" — anything else is worth surfacing.
        if (status !== 401) {
          console.error(
            `Session restore failed (${status ?? error.message}):`,
            error.response?.data?.message,
          );
        }

        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getAndSetUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
