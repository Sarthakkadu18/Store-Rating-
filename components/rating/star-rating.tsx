"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number
  onRatingChange?: (rating: number) => void
  readonly?: boolean
  size?: "sm" | "md" | "lg"
  showValue?: boolean
}

export function StarRating({
  rating,
  onRatingChange,
  readonly = false,
  size = "md",
  showValue = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }

  const handleClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value)
    }
  }

  const handleMouseEnter = (value: number) => {
    if (!readonly) {
      setHoverRating(value)
    }
  }

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0)
    }
  }

  const displayRating = hoverRating || rating

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => {
          const starValue = i + 1
          const isFilled = starValue <= displayRating

          return (
            <Star
              key={i}
              className={cn(
                sizeClasses[size],
                "transition-all duration-150",
                isFilled ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
                !readonly && "cursor-pointer hover:scale-110",
                !readonly && hoverRating >= starValue && "fill-yellow-300 text-yellow-300",
              )}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
            />
          )
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium ml-2">{displayRating > 0 ? `${displayRating}/5` : "No rating"}</span>
      )}
    </div>
  )
}
