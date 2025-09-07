"use client"

import { cn } from "@/lib/utils"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { storeOwnerAPI, type StoreRatingsResponse } from "@/lib/store-owner-api"
import { Star, Users, Mail, Calendar } from "lucide-react"

export function StoreRatingsManagement() {
  const [ratingsData, setRatingsData] = useState<StoreRatingsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [storeId, setStoreId] = useState<number | null>(null)

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        // First get dashboard stats to get store ID
        const dashboardStats = await storeOwnerAPI.getDashboardStats()
        const currentStoreId = dashboardStats.store.id
        setStoreId(currentStoreId)

        // Then fetch ratings for that store
        const ratingsResponse = await storeOwnerAPI.getStoreRatings(currentStoreId)
        setRatingsData(ratingsResponse)
      } catch (error) {
        console.error("Failed to fetch store ratings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRatings()
  }, [])

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn("w-4 h-4", i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300")}
      />
    ))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-48"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!ratingsData) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Unable to load ratings</h3>
          <p className="text-muted-foreground">Please try again later.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Store Ratings</h1>
        <p className="text-muted-foreground">View and manage customer ratings for your store</p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ratingsData.averageRating.toFixed(1)}</div>
            <div className="flex items-center gap-1 mt-1">{renderStars(ratingsData.averageRating)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Ratings</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ratingsData.totalRatings}</div>
            <p className="text-xs text-muted-foreground mt-1">Customer reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rating Status</CardTitle>
            <Calendar className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ratingsData.averageRating >= 4.5
                ? "Excellent"
                : ratingsData.averageRating >= 4
                  ? "Very Good"
                  : ratingsData.averageRating >= 3
                    ? "Good"
                    : ratingsData.averageRating >= 2
                      ? "Fair"
                      : "Poor"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Performance level</p>
          </CardContent>
        </Card>
      </div>

      {/* Ratings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Customer Ratings ({ratingsData.ratings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ratingsData.ratings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No ratings yet</h3>
              <p className="text-muted-foreground">Your store hasn't received any ratings yet.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ratingsData.ratings.map((rating) => (
                    <TableRow key={rating.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{rating.user_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          {rating.user_email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">{renderStars(rating.rating)}</div>
                          <span className="font-medium">{rating.rating}/5</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(rating.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {rating.updated_at !== rating.created_at
                          ? new Date(rating.updated_at).toLocaleDateString()
                          : "Not updated"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
