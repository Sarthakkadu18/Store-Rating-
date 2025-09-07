import { ProtectedRoute } from "@/components/auth/protected-route"
import { StoreOwnerLayout } from "@/components/store-owner/store-owner-layout"
import { StoreRatingsManagement } from "@/components/store-owner/store-ratings-management"

export default function StoreRatingsPage() {
  return (
    <ProtectedRoute allowedRoles={["store_owner"]}>
      <StoreOwnerLayout>
        <StoreRatingsManagement />
      </StoreOwnerLayout>
    </ProtectedRoute>
  )
}
