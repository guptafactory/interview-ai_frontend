import axios from "axios";
import { env } from "../../../config/env.js";

const api = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
});

async function register(username, email, password) {
  const response = await api.post("/auth/register", {
    username,
    email,
    password,
  });

  return response.data;
}

async function login(email, password) {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  return response.data;
}

async function logout() {
  const response = await api.post("/auth/logout");

  return response.data;
}

async function getMe() {
  const response = await api.get("/auth/get-me");

  return response.data;
}

export { register, login, logout, getMe };
