import { ProtectedRoute } from "@/components/auth/protected-route"
import { UserLayout } from "@/components/user/user-layout"
import { StoresBrowser } from "@/components/user/stores-browser"

export default function StoresPage() {
  return (
    <ProtectedRoute allowedRoles={["normal_user"]}>
      <UserLayout>
        <StoresBrowser />
      </UserLayout>
    </ProtectedRoute>
  )
}
