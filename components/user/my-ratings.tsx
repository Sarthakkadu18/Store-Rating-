"use client"

import { useEffect, useState } from "react"
import { adminAPI, type Store } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StarRating } from "@/components/rating/star-rating"
import { RatingModal } from "@/components/rating/rating-modal"
import { Star, MapPin, Mail } from "lucide-react"
import Link from "next/link"

export function MyRatings() {
  const [ratedStores, setRatedStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [showRatingModal, setShowRatingModal] = useState(false)

  const fetchRatedStores = async () => {
    try {
      const response = await adminAPI.getStores({ page: 1, limit: 1000 })
      const storesWithRatings = response.stores.filter((store) => store.user_rating)
      setRatedStores(storesWithRatings)
    } catch (error) {
      console.error("Failed to fetch rated stores:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRatedStores()
  }, [])

  const handleUpdateRating = (store: Store) => {
    setSelectedStore(store)
    setShowRatingModal(true)
  }

  const handleRatingSubmitted = () => {
    fetchRatedStores() // Refresh the list
    setSelectedStore(null)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">My Ratings</h1>
        <p className="text-muted-foreground">View and manage all the stores you've rated</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stores Rated</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ratedStores.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Total ratings given</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Given</CardTitle>
            <Star className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ratedStores.length > 0
                ? (ratedStores.reduce((sum, store) => sum + (store.user_rating || 0), 0) / ratedStores.length).toFixed(
                    1,
                  )
                : "0.0"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Your rating average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Highest Rating</CardTitle>
            <Star className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ratedStores.length > 0 ? Math.max(...ratedStores.map((store) => store.user_rating || 0)) : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Best rating given</p>
          </CardContent>
        </Card>
      </div>

      {/* Rated Stores */}
      {ratedStores.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No ratings yet</h3>
            <p className="text-muted-foreground mb-4">You haven't rated any stores yet. Start exploring!</p>
            <Button asChild>
              <Link href="/stores">Browse Stores</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ratedStores.map((store) => (
            <Card key={store.id} className="transition-all duration-200 hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">{store.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <StarRating rating={store.user_rating || 0} readonly size="md" />
                  <span className="text-sm font-medium">Your rating: {store.user_rating}/5</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{store.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{store.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Store avg: {store.average_rating.toFixed(1)} ({store.total_ratings} reviews)
                  </span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
                    <Link href={`/stores/${store.id}`}>View Details</Link>
                  </Button>
                  <Button size="sm" onClick={() => handleUpdateRating(store)} className="flex-1">
                    Update Rating
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Rating Modal */}
      {selectedStore && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => {
            setShowRatingModal(false)
            setSelectedStore(null)
          }}
          store={{
            id: selectedStore.id,
            name: selectedStore.name,
            address: selectedStore.address,
          }}
          currentRating={selectedStore.user_rating || undefined}
          onRatingSubmitted={handleRatingSubmitted}
        />
      )}
    </div>
  )
}
