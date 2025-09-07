import axios from "axios"

export interface RatingSubmission {
  rating: number
}

export const ratingAPI = {
  submitRating: async (storeId: number, rating: number): Promise<{ message: string }> => {
    const response = await axios.post(`/ratings/stores/${storeId}`, { rating })
    return response.data
  },

  deleteRating: async (storeId: number): Promise<{ message: string }> => {
    const response = await axios.delete(`/ratings/stores/${storeId}`)
    return response.data
  },
}
