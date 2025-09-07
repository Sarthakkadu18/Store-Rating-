import { ProtectedRoute } from "@/components/auth/protected-route"
import { UserLayout } from "@/components/user/user-layout"
import { UserDashboard } from "@/components/user/user-dashboard"

export default function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["normal_user"]}>
      <UserLayout>
        <UserDashboard />
      </UserLayout>
    </ProtectedRoute>
  )
}
