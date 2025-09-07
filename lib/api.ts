import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export interface Store {
  id: number
  name: string
  email: string
  address: string
  average_rating: number
  total_ratings: number
  user_rating?: number | null
  created_at: string
}

export interface User {
  id: number
  name: string
  email: string
  address: string
  role: "system_administrator" | "normal_user" | "store_owner"
  rating?: number
  created_at: string
}

export interface AdminDashboardStats {
  totalUsers: number
  totalStores: number
  totalRatings: number
  roleDistribution: Array<{ role: string; count: number }>
  recentActivity: {
    newUsers: number
    newRatings: number
  }
  topStores: Array<{
    name: string
    address: string
    average_rating: number
    total_ratings: number
  }>
  ratingDistribution: Array<{ rating: number; count: number }>
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    currentPage: number
    totalPages: number
    total: number
    limit: number
  }
}

// Configure axios
axios.defaults.baseURL = API_BASE_URL

export const adminAPI = {
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    const response = await axios.get("/dashboard/admin")
    return response.data
  },

  getUsers: async (params?: {
    search?: string
    role?: string
    sortBy?: string
    sortOrder?: string
    page?: number
    limit?: number
  }): Promise<{ users: User[]; pagination: any }> => {
    const response = await axios.get("/users", { params })
    return response.data
  },

  getUserById: async (id: number): Promise<{ user: User }> => {
    const response = await axios.get(`/users/${id}`)
    return response.data
  },

  createUser: async (userData: {
    name: string
    email: string
    password: string
    address: string
    role: string
  }): Promise<{ user: User }> => {
    const response = await axios.post("/users", userData)
    return response.data
  },

  getStores: async (params?: {
    search?: string
    sortBy?: string
    sortOrder?: string
    page?: number
    limit?: number
  }): Promise<{ stores: Store[]; pagination: any }> => {
    const response = await axios.get("/stores", { params })
    return response.data
  },

  createStore: async (storeData: {
    name: string
    email: string
    address: string
    ownerId?: number
  }): Promise<{ store: Store }> => {
    const response = await axios.post("/stores", storeData)
    return response.data
  },
}
