import { ProtectedRoute } from "@/components/auth/protected-route"
import { UserLayout } from "@/components/user/user-layout"
import { StoreDetail } from "@/components/user/store-detail"

export default function StoreDetailPage() {
  return (
    <ProtectedRoute allowedRoles={["normal_user"]}>
      <UserLayout>
        <StoreDetail />
      </UserLayout>
    </ProtectedRoute>
  )
}
