import axios from "axios"

export interface StoreOwnerDashboardStats {
  store: {
    id: number
    name: string
  }
  averageRating: number
  totalRatings: number
  recentRatings: number
  ratingDistribution: Array<{ rating: number; count: number }>
  recentRatingsList: Array<{
    rating: number
    created_at: string
    user_name: string
  }>
  monthlyTrends: Array<{
    month: string
    average_rating: number
    total_ratings: number
  }>
}

export interface StoreRating {
  id: number
  rating: number
  created_at: string
  updated_at: string
  user_name: string
  user_email: string
}

export interface StoreRatingsResponse {
  ratings: StoreRating[]
  averageRating: number
  totalRatings: number
}

export const storeOwnerAPI = {
  getDashboardStats: async (): Promise<StoreOwnerDashboardStats> => {
    const response = await axios.get("/dashboard/store-owner")
    return response.data
  },

  getStoreRatings: async (storeId: number): Promise<StoreRatingsResponse> => {
    const response = await axios.get(`/ratings/stores/${storeId}`)
    return response.data
  },
}
