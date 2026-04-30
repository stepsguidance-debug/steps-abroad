import { LayoutDashboard, Users, BookOpen, GraduationCap, Activity } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import UserBadge from "@/components/UserBadge";
import { apiClient } from "@/lib/apiClient";

const navItems = [
  { to: "/admin",           label: "Overview",      icon: LayoutDashboard, end: true },
  { to: "/admin/users",     label: "Manage Users",  icon: Users },
  { to: "/admin/questions", label: "Question Bank", icon: BookOpen },
];

const AdminLayout = () => {
  const [healthOk, setHealthOk] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    apiClient.getSystemHealth()
      .then((r) => { if (active) setHealthOk(r.overall === "healthy"); })
      .catch(() => { if (active) setHealthOk(false); });
    return () => { active = false; };
  }, []);

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
        <nav className="flex-1 p-3 grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-1 gap-1">
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
          <NavLink to="/admin/system"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? "btn-gold" : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`
            }>
            <Activity className="h-4 w-4" />
            <span className="min-w-0 truncate flex-1">System Status</span>
            <span className="relative inline-flex h-2.5 w-2.5">
              <span className={`absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping ${
                healthOk === false ? "bg-destructive" : "bg-success"
              }`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                healthOk === false ? "bg-destructive" : healthOk === true ? "bg-success" : "bg-muted-foreground"
              }`} style={{ backgroundColor: healthOk === false ? "hsl(var(--destructive))" : "hsl(var(--success))" }} />
            </span>
          </NavLink>
        </nav>
      </aside>

      <div className="min-w-0 flex-1 flex flex-col">
        <header className="min-h-16 border-b border-border px-4 py-3 sm:px-6 lg:px-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-lg font-semibold">Admin Console</h1>
          <UserBadge />
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
