import { ProtectedRoute } from "@/components/auth/protected-route"
import { UserLayout } from "@/components/user/user-layout"
import { MyRatings } from "@/components/user/my-ratings"

export default function MyRatingsPage() {
  return (
    <ProtectedRoute allowedRoles={["normal_user"]}>
      <UserLayout>
        <MyRatings />
      </UserLayout>
    </ProtectedRoute>
  )
}
