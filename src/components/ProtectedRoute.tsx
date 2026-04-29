import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/lib/types";

interface Props {
  children: React.ReactNode;
  role?: Role;
}

const ProtectedRoute = ({ children, role }: Props) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/assessment"} replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
