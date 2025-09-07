"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Store, Star, User, TrendingUp } from "lucide-react"
import Link from "next/link"

export function UserDashboard() {
  const { user } = useAuth()

  const quickActions = [
    {
      title: "Browse Stores",
      description: "Discover new stores to rate",
      icon: Store,
      href: "/stores",
      color: "text-primary",
    },
    {
      title: "My Ratings",
      description: "View and manage your ratings",
      icon: Star,
      href: "/my-ratings",
      color: "text-secondary",
    },
    {
      title: "Profile",
      description: "Update your profile information",
      icon: User,
      href: "/profile",
      color: "text-accent",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name?.split(" ")[0]}!</h1>
        <p className="text-muted-foreground">
          Ready to discover and rate amazing stores? Start exploring our platform.
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map((action, index) => (
            <Card key={index} className="transition-all duration-200 hover:shadow-md hover:scale-[1.02]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3">
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                  {action.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{action.description}</p>
                <Button asChild className="w-full">
                  <Link href={action.href}>Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Getting Started
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Store className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Explore Stores</h4>
                <p className="text-sm text-muted-foreground">
                  Browse through our collection of stores and find ones that interest you.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-secondary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Rate Your Experience</h4>
                <p className="text-sm text-muted-foreground">
                  Share your experience by rating stores from 1 to 5 stars.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-accent" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Manage Your Profile</h4>
                <p className="text-sm text-muted-foreground">Keep your profile information up to date and secure.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
