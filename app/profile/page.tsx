import { ProtectedRoute } from "@/components/auth/protected-route"
import { UserLayout } from "@/components/user/user-layout"
import { ProfileManagement } from "@/components/user/profile-management"

export default function ProfilePage() {
  return (
    <ProtectedRoute allowedRoles={["normal_user"]}>
      <UserLayout>
        <ProfileManagement />
      </UserLayout>
    </ProtectedRoute>
  )
}
