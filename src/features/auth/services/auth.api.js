import axios from "axios";
import { API_URL } from "../../../../constants.js";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

async function register({ username, email, password }) {
  try {
    const response = await api.post("/auth/register", {
      username,
      email,
      password,
    });

    return response.data;
  } catch (error) {
    console.error(error);
  }
}

async function login({ email, password }) {
  try {
    const response = api.post("/auth/login", {
      email,
      password,
    });

    return response.data;
  } catch (error) {
    console.error(error);
  }
}

async function logout() {
  try {
    const response = api.get("/auth/logout");

    return response.data;
  } catch (error) {
    console.error(error);
  }
}

async function getMe() {
  try {
    const response = api.get("/auth/get-me");

    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export { register, login, logout, getMe };
