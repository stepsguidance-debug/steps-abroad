import { LayoutDashboard, Users, BookOpen, GraduationCap, Activity } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import UserBadge from "@/components/UserBadge";
import { apiClient } from "@/lib/apiClient";

const navItems = [
  { to: "/admin",           label: "Overview",      icon: LayoutDashboard, end: true },
  { to: "/admin/users",     label: "Manage Users",  icon: Users },
  { to: "/admin/questions", label: "Question Bank", icon: BookOpen },
  { to: "/admin/system",    label: "System Status", icon: Activity },
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
    <div className="min-h-screen w-full overflow-x-hidden">
      <header className="border-b border-border px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-5">
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex items-center gap-3">
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
            <UserBadge />
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold">Admin Console</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage students, questions, and system status from one place.</p>
          </div>

          <nav className="flex w-full justify-center">
            <div className="glass-card flex w-full max-w-4xl flex-wrap items-center justify-center gap-2 p-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                      isActive ? "btn-gold" : "text-foreground hover:bg-secondary/60"
                    }`
                  }
                >
                  <item.icon className="h-4 w-4" />
                  <span className="whitespace-nowrap">{item.label}</span>
                  {item.to === "/admin/system" && (
                    <span className="relative inline-flex h-2.5 w-2.5">
                      <span className={`absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping ${
                        healthOk === false ? "bg-destructive" : "bg-success"
                      }`} />
                      <span
                        className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                          healthOk === false ? "bg-destructive" : healthOk === true ? "bg-success" : "bg-muted-foreground"
                        }`}
                        style={{ backgroundColor: healthOk === false ? "hsl(var(--destructive))" : healthOk === true ? "hsl(var(--success))" : "hsl(var(--muted-foreground))" }}
                      />
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
