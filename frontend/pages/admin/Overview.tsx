import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, CheckCircle2, Clock, Sparkles, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import { downloadResultDashboardPdf } from "@/lib/resultPdfExport";
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
    answered: "bg-success/15 text-success border-success/30",
    pending: "bg-muted text-muted-foreground border-border",
  } as const;
  const label = { answered: "Answered", pending: "Pending" }[status];
  return <span className={`text-[10px] px-2 py-0.5 rounded-full border ${map[status]}`}>{label}</span>;
};

const Overview = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.getStudents().then((s) => { setStudents(s); setLoading(false); });
  }, []);

  const total = students.length;
  const answered = students.filter((s) => s.status === "answered").length;
  const pending = students.filter((s) => s.status !== "answered").length;
  const completedScores = students.map((s) => s.aiReadiness).filter((v): v is number => typeof v === "number");
  const avgReadiness = completedScores.length
    ? Math.round(completedScores.reduce((a, b) => a + b, 0) / completedScores.length)
    : 0;

  const downloadPdf = async (s: Student) => {
    try {
      const data = await apiClient.getResult(s._id);
      if (!data) {
        toast({ title: "No result to export", variant: "destructive" });
        return;
      }
      await downloadResultDashboardPdf(data);
      toast({ title: "PDF downloaded" });
    } catch (err) {
      toast({
        title: "Could not download PDF",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total students" value={total} />
        <StatCard icon={CheckCircle2} label="Answered" value={answered} />
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
              const showPdf = s.status === "answered";
              const cardInner = (
                <>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full btn-gold flex items-center justify-center font-bold">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0 pr-14">
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
                </>
              );
              return s.status === "answered" ? (
                <div key={s._id} className="glass-card p-5 hover:-translate-y-0.5 transition-transform relative">
                  <Link to={`/admin/results/${s._id}`} className="block">{cardInner}</Link>
                  {showPdf ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="absolute top-4 right-4 gap-1 shadow-sm"
                      title="Download result as PDF"
                      onClick={(e) => {
                        e.preventDefault();
                        void downloadPdf(s);
                      }}
                    >
                      <Download className="h-4 w-4" />
                      PDF
                    </Button>
                  ) : null}
                </div>
              ) : (
                <div key={s._id} className="glass-card p-5">
                  {cardInner}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Overview;
