import { LogOut, LayoutDashboard, Users, BookOpen, GraduationCap } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { to: "/admin",           label: "Overview",      icon: LayoutDashboard, end: true },
  { to: "/admin/users",     label: "Manage Users",  icon: Users },
  { to: "/admin/questions", label: "Question Bank", icon: BookOpen },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full overflow-x-hidden lg:flex">
      <aside className="w-full shrink-0 bg-sidebar border-b border-sidebar-border lg:w-64 lg:border-b-0 lg:border-r flex flex-col">
        <div className="p-4 sm:p-5 flex items-center gap-3 border-b border-sidebar-border">
          <div className="h-10 w-10 rounded-xl btn-gold flex items-center justify-center">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight">
              <span className="gold-text">Steps</span> Guidance
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Admin Console</p>
          </div>
        </div>
        <nav className="flex-1 p-3 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? "btn-gold" : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`
              }>
              <item.icon className="h-4 w-4" />
              <span className="min-w-0 truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <button onClick={() => { logout(); navigate("/login"); }}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1 flex flex-col">
        <header className="min-h-16 border-b border-border px-4 py-3 sm:px-6 lg:px-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-lg font-semibold">Welcome, {user?.name ?? "Admin"}</h1>
          <span className="min-w-0 text-xs text-muted-foreground break-all sm:text-right">{user?.email}</span>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
