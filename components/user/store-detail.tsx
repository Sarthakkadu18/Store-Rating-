"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { adminAPI, type Store } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StarRating } from "@/components/rating/star-rating"
import { RatingModal } from "@/components/rating/rating-modal"
import { MapPin, Mail, Star, Users, ArrowLeft, Calendar } from "lucide-react"
import Link from "next/link"

export function StoreDetail() {
  const params = useParams()
  const router = useRouter()
  const storeId = Number(params.id)

  const [store, setStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)
  const [showRatingModal, setShowRatingModal] = useState(false)

  const fetchStore = async () => {
    try {
      const response = await adminAPI.getStores({ page: 1, limit: 1000 })
      const foundStore = response.stores.find((s) => s.id === storeId)
      if (foundStore) {
        setStore(foundStore)
      } else {
        router.push("/stores")
      }
    } catch (error) {
      console.error("Failed to fetch store:", error)
      router.push("/stores")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (storeId) {
      fetchStore()
    }
  }, [storeId])

  const handleRatingSubmitted = () => {
    fetchStore() // Refresh store data to get updated rating
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-4"></div>
          <Card>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!store) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Store not found</h3>
          <p className="text-muted-foreground mb-4">The store you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/stores">Back to Stores</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild className="gap-2">
        <Link href="/stores">
          <ArrowLeft className="w-4 h-4" />
          Back to Stores
        </Link>
      </Button>

      {/* Store Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{store.name}</CardTitle>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <StarRating rating={store.average_rating} readonly size="lg" />
                  <span className="text-lg font-semibold">{store.average_rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({store.total_ratings} reviews)</span>
                </div>
                {store.user_rating && (
                  <Badge variant="secondary" className="gap-1">
                    <Star className="w-3 h-3" />
                    You rated: {store.user_rating}/5
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>{store.address}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="w-5 h-5 flex-shrink-0" />
            <span>{store.email}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-5 h-5 flex-shrink-0" />
            <span>Added on {new Date(store.created_at).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Rating Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Your Rating
          </CardTitle>
        </CardHeader>
        <CardContent>
          {store.user_rating ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <StarRating rating={store.user_rating} readonly size="lg" />
                <span className="text-lg font-semibold">{store.user_rating}/5</span>
                <Badge variant="secondary">
                  {store.user_rating === 1 && "Poor"}
                  {store.user_rating === 2 && "Fair"}
                  {store.user_rating === 3 && "Good"}
                  {store.user_rating === 4 && "Very Good"}
                  {store.user_rating === 5 && "Excellent"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                You have already rated this store. You can update or remove your rating anytime.
              </p>
              <Button onClick={() => setShowRatingModal(true)} className="gap-2">
                <Star className="w-4 h-4" />
                Update Rating
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">You haven't rated this store yet.</p>
              <Button onClick={() => setShowRatingModal(true)} className="gap-2">
                <Star className="w-4 h-4" />
                Rate This Store
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Store Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{store.average_rating.toFixed(1)}</div>
            <div className="flex items-center gap-1 mt-1">
              <StarRating rating={store.average_rating} readonly size="sm" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Reviews</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{store.total_ratings}</div>
            <p className="text-xs text-muted-foreground mt-1">Customer ratings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rating Status</CardTitle>
            <Calendar className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {store.average_rating >= 4.5
                ? "Excellent"
                : store.average_rating >= 4
                  ? "Very Good"
                  : store.average_rating >= 3
                    ? "Good"
                    : store.average_rating >= 2
                      ? "Fair"
                      : "Poor"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Performance level</p>
          </CardContent>
        </Card>
      </div>

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        store={{
          id: store.id,
          name: store.name,
          address: store.address,
        }}
        currentRating={store.user_rating || undefined}
        onRatingSubmitted={handleRatingSubmitted}
      />
    </div>
  )
}
