import axios from "axios"
import Cookies from "js-cookie"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export interface User {
  id: number
  name: string
  email: string
  address: string
  role: "system_administrator" | "normal_user" | "store_owner"
}

export interface AuthResponse {
  message: string
  token: string
  user: User
}

export interface RegisterData {
  name: string
  email: string
  password: string
  address: string
}

export interface LoginData {
  email: string
  password: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL

// Add token to requests if available
axios.interceptors.request.use((config) => {
  const token = Cookies.get("auth_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      Cookies.remove("auth_token")
      Cookies.remove("user_data")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

export const authAPI = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await axios.post("/auth/register", data)
    return response.data
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await axios.post("/auth/login", data)
    return response.data
  },

  changePassword: async (data: ChangePasswordData): Promise<{ message: string }> => {
    const response = await axios.put("/auth/change-password", data)
    return response.data
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    const response = await axios.get("/auth/me")
    return response.data
  },

  logout: () => {
    Cookies.remove("auth_token")
    Cookies.remove("user_data")
  },
}

export const setAuthToken = (token: string) => {
  Cookies.set("auth_token", token, { expires: 7, secure: true, sameSite: "strict" })
}

export const setUserData = (user: User) => {
  Cookies.set("user_data", JSON.stringify(user), { expires: 7, secure: true, sameSite: "strict" })
}

export const getAuthToken = (): string | undefined => {
  return Cookies.get("auth_token")
}

export const getUserData = (): User | null => {
  const userData = Cookies.get("user_data")
  return userData ? JSON.parse(userData) : null
}

export const isAuthenticated = (): boolean => {
  return !!getAuthToken()
}
