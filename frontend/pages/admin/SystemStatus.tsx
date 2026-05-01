import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2, Activity } from "lucide-react";
import { apiClient, type SystemHealthReport } from "@/lib/apiClient";

const LIMITS = [
  {
    model: "Gemini 2.5 Pro",
    rows: [
      { label: "Requests per minute", value: "2 RPM" },
      { label: "Requests per day", value: "50 RPD" },
      { label: "Tokens per minute", value: "32,000 TPM" },
    ],
  },
  {
    model: "Gemini 2.5 Flash",
    rows: [
      { label: "Requests per minute", value: "10 RPM" },
      { label: "Requests per day", value: "500 RPD" },
      { label: "Tokens per minute", value: "250,000 TPM" },
    ],
  },
];

const SystemStatus = () => {
  const [report, setReport] = useState<SystemHealthReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    apiClient.getSystemHealth()
      .then(setReport)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl btn-gold flex items-center justify-center">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">System Status</h1>
            <p className="text-sm text-muted-foreground">Live health of every backend connection</p>
          </div>
        </div>
        <button onClick={load} className="btn-gold px-4 py-2 text-sm">Re-run check</button>
      </header>

      <section className="glass-card p-5">
        <h2 className="font-semibold mb-4">Connection Health</h2>
        {loading && (
          <p className="text-sm text-muted-foreground inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Running health checks…
          </p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {report && (
          <div className="divide-y divide-border">
            {report.checks.map((c) => (
              <div key={c.name} className="py-3 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium">{c.name}</p>
                  {c.detail && <p className="text-xs text-muted-foreground mt-0.5">{c.detail}</p>}
                  {c.error && <p className="text-xs text-destructive mt-0.5">{c.error}</p>}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {typeof c.responseMs === "number" && (
                    <span className="text-xs text-muted-foreground">{c.responseMs} ms</span>
                  )}
                  {c.status === "ok" ? (
                    <span className="inline-flex items-center gap-1 text-success text-sm font-medium">
                      <CheckCircle2 className="h-4 w-4" /> Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-destructive text-sm font-medium">
                      <XCircle className="h-4 w-4" /> Failed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="glass-card p-5">
        <h2 className="font-semibold mb-1">Gemini API Usage Limits (Free Tier)</h2>
        <p className="text-xs text-muted-foreground mb-4">Hard caps from Google. Each student submission uses 1 Gemini 2.5 Pro request + 6 Gemini 2.5 Flash requests (3 primary job roles + 3 secondary job roles).</p>
        {report && (
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Active Runtime Config</p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Pro model</span>
                  <span className="font-mono">{report.geminiModelPro || "—"}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Flash model</span>
                  <span className="font-mono">{report.geminiModelFlash || "—"}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Summary model</span>
                  <span className="font-mono">{report.geminiModelSummary || "—"}</span>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Server Runtime Config</p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Admin DB</span>
                  <span className="font-mono">{report.dbAdmin || "—"}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Students DB</span>
                  <span className="font-mono">{report.dbStudents || "—"}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Queue delay</span>
                  <span className="font-mono">{report.geminiQueueDelayMs != null ? `${report.geminiQueueDelayMs} ms` : "—"}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Queue max size</span>
                  <span className="font-mono">{report.geminiQueueMaxSize ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Port</span>
                  <span className="font-mono">{report.port ?? "—"}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LIMITS.map((m) => (
            <div key={m.model} className="rounded-xl border border-border p-4">
              <p className="font-semibold mb-2">{m.model}</p>
              <div className="space-y-1.5 text-sm">
                {m.rows.map((r) => (
                  <div key={r.label} className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className="font-mono font-medium">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Note: submissions are processed one at a time with the configured queue delay between concurrent submissions.
        </p>
      </section>
    </div>
  );
};

export default SystemStatus;
