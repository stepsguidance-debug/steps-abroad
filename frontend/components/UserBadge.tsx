import { LogOut, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

function getInitials(name: string): string {
  const trimmed = (name || "").trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface Props {
  variant?: "default" | "compact";
  showLogout?: boolean;
}

const UserBadge = ({ variant = "default", showLogout = true }: Props) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const isAdmin = user.role === "admin";
  const displayName = isAdmin ? "Admin" : user.name;
  const initials = isAdmin ? null : getInitials(user.name);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl border border-border bg-background-elevated/40">
        <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center text-xs font-bold text-primary border border-border">
          {isAdmin ? <Shield className="h-4 w-4" /> : initials}
        </div>
        {variant === "default" && (
          <span className="text-sm font-medium pr-1 max-w-[10rem] truncate">{displayName}</span>
        )}
      </div>
      {showLogout && (
        <button
          onClick={() => { logout(); navigate("/login"); }}
          title="Sign out"
          className="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-border bg-background-elevated/40 hover:bg-secondary/60 transition-colors"
        >
          <LogOut className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default UserBadge;
