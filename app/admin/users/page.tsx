import { ProtectedRoute } from "@/components/auth/protected-route"
import { AdminLayout } from "@/components/admin/admin-layout"
import { UsersManagement } from "@/components/admin/users-management"

export default function AdminUsersPage() {
  return (
    <ProtectedRoute allowedRoles={["system_administrator"]}>
      <AdminLayout>
        <UsersManagement />
      </AdminLayout>
    </ProtectedRoute>
  )
}
