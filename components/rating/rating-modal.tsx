"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { StarRating } from "./star-rating"
import { ratingAPI } from "@/lib/rating-api"
import { Loader2, Star, Trash2 } from "lucide-react"

interface RatingModalProps {
  isOpen: boolean
  onClose: () => void
  store: {
    id: number
    name: string
    address: string
  }
  currentRating?: number
  onRatingSubmitted: () => void
}

export function RatingModal({ isOpen, onClose, store, currentRating, onRatingSubmitted }: RatingModalProps) {
  const [rating, setRating] = useState(currentRating || 0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await ratingAPI.submitRating(store.id, rating)
      setSuccess(response.message)
      onRatingSubmitted()
      setTimeout(() => {
        onClose()
        setSuccess("")
      }, 1500)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit rating")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await ratingAPI.deleteRating(store.id)
      setSuccess("Rating deleted successfully")
      onRatingSubmitted()
      setTimeout(() => {
        onClose()
        setSuccess("")
      }, 1500)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete rating")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setRating(currentRating || 0)
    setError("")
    setSuccess("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            {currentRating ? "Update Rating" : "Rate Store"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Store Info */}
          <div className="text-center">
            <h3 className="font-semibold text-lg">{store.name}</h3>
            <p className="text-sm text-muted-foreground">{store.address}</p>
          </div>

          {/* Rating Selection */}
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">How would you rate this store?</p>
            <div className="flex justify-center">
              <StarRating rating={rating} onRatingChange={setRating} size="lg" showValue />
            </div>
            {rating > 0 && (
              <p className="text-sm font-medium">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            )}
          </div>

          {/* Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <AlertDescription className="text-green-600">{success}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {currentRating && (
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 gap-2 text-destructive hover:text-destructive bg-transparent"
              >
                <Trash2 className="w-4 h-4" />
                Delete Rating
              </Button>
            )}
            <Button onClick={handleSubmit} disabled={loading || rating === 0} className="flex-1 gap-2">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {currentRating ? "Updating..." : "Submitting..."}
                </>
              ) : (
                <>
                  <Star className="w-4 h-4" />
                  {currentRating ? "Update Rating" : "Submit Rating"}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
