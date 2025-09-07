import { ProtectedRoute } from "@/components/auth/protected-route"
import { StoreOwnerLayout } from "@/components/store-owner/store-owner-layout"
import { StoreDashboard } from "@/components/store-owner/store-dashboard"

export default function StoreDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["store_owner"]}>
      <StoreOwnerLayout>
        <StoreDashboard />
      </StoreOwnerLayout>
    </ProtectedRoute>
  )
}
