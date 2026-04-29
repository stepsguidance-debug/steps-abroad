import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import type { Student } from "@/lib/types";

const StatCard = ({ icon: Icon, label, value, accent }: { icon: typeof Users; label: string; value: string | number; accent?: boolean }) => (
  <div className={`glass-card p-5 ${accent ? "border-primary/40" : ""}`}>
    <div className="flex items-center justify-between">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <Icon className={`h-4 w-4 ${accent ? "text-primary" : "text-muted-foreground"}`} />
    </div>
    <p className={`mt-3 text-3xl font-bold ${accent ? "gold-text" : "text-foreground"}`}>{value}</p>
  </div>
);

const StatusBadge = ({ status }: { status: Student["status"] }) => {
  const map = {
    completed:   "bg-success/15 text-success border-success/30",
    in_progress: "bg-primary/15 text-primary border-primary/30",
    pending:     "bg-muted text-muted-foreground border-border",
  } as const;
  const label = { completed: "Completed", in_progress: "In progress", pending: "Pending" }[status];
  return <span className={`text-[10px] px-2 py-0.5 rounded-full border ${map[status]}`}>{label}</span>;
};

const Overview = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.getStudents().then((s) => { setStudents(s); setLoading(false); });
  }, []);

  const total = students.length;
  const answered = students.filter((s) => s.status === "completed").length;
  const pending = students.filter((s) => s.status !== "completed").length;
  const completedScores = students.map((s) => s.aiReadiness).filter((v): v is number => typeof v === "number");
  const avgReadiness = completedScores.length
    ? Math.round(completedScores.reduce((a, b) => a + b, 0) / completedScores.length)
    : 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total students" value={total} />
        <StatCard icon={CheckCircle2} label="Completed" value={answered} />
        <StatCard icon={Clock} label="Pending" value={pending} />
        <StatCard icon={Sparkles} label="Avg AI Readiness" value={`${avgReadiness}%`} accent />
      </div>

      <section>
        <h2 className="text-xl font-bold mb-4">Students</h2>
        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {students.map((s) => {
              const initials = s.name.split(" ").map((n) => n[0]).slice(0, 2).join("");
              const card = (
                <div className="glass-card p-5 hover:-translate-y-0.5 transition-transform">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full btn-gold flex items-center justify-center font-bold">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <StatusBadge status={s.status} />
                    {s.aiReadiness != null ? (
                      <span className="text-sm font-bold gold-text">{s.aiReadiness}%</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>
                </div>
              );
              return s.status === "completed" ? (
                <Link key={s._id} to={`/admin/results/${s._id}`}>{card}</Link>
              ) : (
                <div key={s._id}>{card}</div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Overview;
