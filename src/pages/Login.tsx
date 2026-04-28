import { useState } from "react";
import { GraduationCap, Mail, Lock, ShieldCheck, User } from "lucide-react";

const Login = () => {
  const [role, setRole] = useState<"admin" | "student">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
      {/* Decorative world map watermark */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 w-full h-full opacity-[0.06]"
        viewBox="0 0 1200 600"
        fill="none"
      >
        <circle cx="200" cy="200" r="2" fill="hsl(var(--primary))" />
        <circle cx="320" cy="180" r="2" fill="hsl(var(--primary))" />
        <circle cx="450" cy="220" r="2" fill="hsl(var(--primary))" />
        <circle cx="600" cy="200" r="2" fill="hsl(var(--primary))" />
        <circle cx="780" cy="240" r="2" fill="hsl(var(--primary))" />
        <circle cx="900" cy="200" r="2" fill="hsl(var(--primary))" />
        <circle cx="1000" cy="280" r="2" fill="hsl(var(--primary))" />
        <path d="M100 300 Q 600 100 1100 300" stroke="hsl(var(--primary))" strokeWidth="0.5" strokeDasharray="4 6" fill="none" />
        <path d="M100 400 Q 600 600 1100 400" stroke="hsl(var(--primary))" strokeWidth="0.5" strokeDasharray="4 6" fill="none" />
      </svg>

      {/* Brand */}
      <header className="relative z-10 mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl btn-gold">
          <GraduationCap className="h-8 w-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold">
          <span className="gold-text">Steps</span>{" "}
          <span className="text-foreground">Guidance</span>
        </h1>
        <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-md">
          AI-powered career guidance for students planning higher education abroad.
        </p>
      </header>

      {/* Login card */}
      <main className="relative z-10 w-full max-w-md glass-card p-8">
        {/* Role toggle */}
        <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-secondary/50 p-1">
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
              role === "student"
                ? "btn-gold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="h-4 w-4" /> Student
          </button>
          <button
            type="button"
            onClick={() => setRole("admin")}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
              role === "admin"
                ? "btn-gold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShieldCheck className="h-4 w-4" /> Admin
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Sign in to continue your {role === "admin" ? "admin dashboard" : "career journey"}.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            // TODO: wire to Lovable Cloud auth in next step
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-border bg-background/40 pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-border bg-background/40 pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition"
              />
            </div>
          </div>

          <button type="submit" className="btn-gold w-full py-3 text-sm">
            Sign in as {role === "admin" ? "Admin" : "Student"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Demo build · backend & AI flows connect in the next step
        </p>
      </main>

      <footer className="relative z-10 mt-10 text-xs text-muted-foreground">
        © {new Date().getFullYear()} Steps Guidance · Study smarter, abroad.
      </footer>
    </div>
  );
};

export default Login;
