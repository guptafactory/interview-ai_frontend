import { useContext } from "react";
import { AuthContext } from "../auth.context.jsx";
import { login, register, logout, getMe } from "../services/auth.api.js";

export function useAuth() {
  const { user, setUser, loading, setLoading } = useContext(AuthContext);
}
