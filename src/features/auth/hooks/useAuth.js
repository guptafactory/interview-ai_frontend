import { useContext } from "react";
import AuthContext from "../contexts/auth.context.js";
import { login, register, logout } from "../services/auth.api.js";

export function useAuth() {
  const { user, setUser, loading, setLoading } = useContext(AuthContext);

  async function handleRegister(username, email, password) {
    try {
      setLoading(true);
      const data = await register(username, email, password);
      setUser(data?.user ?? null);
      return Boolean(data?.user);
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(email, password) {
    try {
      setLoading(true);
      const data = await login(email, password);
      setUser(data?.user ?? null);
      return Boolean(data?.user);
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      setLoading(true);
      await logout();
      setUser(null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return { user, loading, handleRegister, handleLogin, handleLogout };
}
