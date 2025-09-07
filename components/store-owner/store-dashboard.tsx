"use client"

import { cn } from "@/lib/utils"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { storeOwnerAPI, type StoreOwnerDashboardStats } from "@/lib/store-owner-api"
import { Star, TrendingUp, Users, Calendar } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

const COLORS = ["#0891b2", "#6366f1", "#d97706", "#4b5563", "#f9fafb"]

export function StoreDashboard() {
  const [stats, setStats] = useState<StoreOwnerDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await storeOwnerAPI.getDashboardStats()
        setStats(data)
      } catch (error) {
        console.error("Failed to fetch store dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-20"></div>
                <div className="h-4 w-4 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                <div className="h-3 bg-muted rounded w-24"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No store found</h3>
          <p className="text-muted-foreground">You don't seem to own any store yet.</p>
        </CardContent>
      </Card>
    )
  }

  const statCards = [
    {
      title: "Average Rating",
      value: stats.averageRating.toFixed(1),
      icon: Star,
      description: "Overall store rating",
      color: "text-yellow-500",
    },
    {
      title: "Total Ratings",
      value: stats.totalRatings,
      icon: Users,
      description: "All time ratings",
      color: "text-primary",
    },
    {
      title: "Recent Ratings",
      value: stats.recentRatings,
      icon: TrendingUp,
      description: "This month",
      color: "text-secondary",
    },
    {
      title: "Store Performance",
      value: stats.averageRating >= 4 ? "Excellent" : stats.averageRating >= 3 ? "Good" : "Needs Improvement",
      icon: Calendar,
      description: "Based on ratings",
      color: "text-accent",
    },
  ]

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn("w-4 h-4", i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300")}
      />
    ))
  }

  return (
    <div className="space-y-6">
      {/* Store Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">{stats.store.name}</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">{renderStars(stats.averageRating)}</div>
          <span className="text-lg font-medium">{stats.averageRating.toFixed(1)}</span>
          <span className="text-muted-foreground">({stats.totalRatings} reviews)</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="transition-all duration-200 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={cn("h-4 w-4", stat.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Rating Trends (6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short" })}
                />
                <YAxis domain={[0, 5]} />
                <Tooltip
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", { month: "long", year: "numeric" })
                  }
                  formatter={(value: number) => [value.toFixed(1), "Average Rating"]}
                />
                <Line
                  type="monotone"
                  dataKey="average_rating"
                  stroke="#0891b2"
                  strokeWidth={2}
                  dot={{ fill: "#0891b2", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Rating Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.ratingDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0891b2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Ratings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recent Customer Ratings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentRatingsList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No ratings yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentRatingsList.slice(0, 10).map((rating, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{rating.user_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(rating.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">{renderStars(rating.rating)}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
