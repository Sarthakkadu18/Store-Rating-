import { ProtectedRoute } from "@/components/auth/protected-route"
import { AdminLayout } from "@/components/admin/admin-layout"
import { DashboardStats } from "@/components/admin/dashboard-stats"

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["system_administrator"]}>
      <AdminLayout>
        <DashboardStats />
      </AdminLayout>
    </ProtectedRoute>
  )
}
