import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RTooltip } from "recharts";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { AiRisk, CareerFitItem, Result } from "@/lib/types";

const RISK_META: Record<AiRisk, { dot: string; label: string; ring: string }> = {
  low:    { dot: "bg-success",     label: "Low AI risk",    ring: "border-success/40" },
  medium: { dot: "bg-primary",     label: "Medium AI risk", ring: "border-primary/40" },
  high:   { dot: "bg-destructive", label: "High AI risk",   ring: "border-destructive/40" },
};

const RiskPill = ({ risk, advice }: { risk: AiRisk; advice: string }) => {
  const m = RISK_META[risk];
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full border ${m.ring} cursor-help`}>
            <span className={`h-2 w-2 rounded-full ${m.dot}`} />
            {m.label}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">{advice}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const CareerCard = ({ item, tier }: { item: CareerFitItem; tier: "primary" | "secondary" }) => (
  <div className={`glass-card p-5 border-2 ${tier === "primary" ? "border-primary/60" : "border-muted-foreground/30"}`}>
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {tier === "primary" ? "Primary fit" : "Secondary fit"}
        </p>
        <h4 className="text-lg font-bold mt-1">{item.title}</h4>
      </div>
      <RiskPill risk={item.aiRisk} advice={item.advice} />
    </div>
    <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
      <div className="rounded-lg bg-secondary/40 p-2.5"><p className="text-muted-foreground">Undergraduate</p><p className="font-medium">{item.ug}</p></div>
      <div className="rounded-lg bg-secondary/40 p-2.5"><p className="text-muted-foreground">Postgraduate</p><p className="font-medium">{item.pg}</p></div>
    </div>
    <div className="mt-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Sample roles</p>
      <ul className="text-xs space-y-1">
        {item.roles.map((r) => <li key={r} className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-primary" />{r}</li>)}
      </ul>
    </div>
  </div>
);

const ReadinessBadge = ({ score }: { score: number }) => {
  const tone = score >= 75 ? "bg-success/15 text-success border-success/40"
            : score >= 50 ? "bg-primary/15 text-primary border-primary/40"
            : "bg-destructive/15 text-destructive border-destructive/40";
  const label = score >= 75 ? "Highly future-ready" : score >= 50 ? "Adaptable" : "Needs strengthening";
  return (
    <div className={`inline-flex items-center gap-3 rounded-2xl border px-5 py-3 ${tone}`}>
      <span className="text-3xl font-bold">{score}%</span>
      <span className="text-xs uppercase tracking-wider">{label}</span>
    </div>
  );
};

interface Props { result: Result }

const ResultDashboard = ({ result }: Props) => {
  const traitData = Object.entries(result.traitScores).map(([name, value]) => ({ name, value }));
  const COLORS = ["hsl(var(--primary))", "hsl(var(--primary-glow))", "hsl(var(--success))", "hsl(var(--accent))"];

  return (
    <div className="space-y-8">
      <header className="glass-card p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">AI Readiness Index</p>
          <h2 className="text-2xl font-bold mt-1">{result.userName}</h2>
          <p className="text-sm text-muted-foreground mt-1">{result.behaviourProfile}</p>
        </div>
        <ReadinessBadge score={result.aiReadinessIndex} />
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-3">
          {traitData.map((t) => (
            <div key={t.name} className="glass-card p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{t.name}</p>
              <p className="mt-2 text-2xl font-bold gold-text">{t.value}%</p>
              <div className="mt-2 h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
                <div className="h-full btn-gold" style={{ width: `${t.value}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="glass-card p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Trait distribution</p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={traitData} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={3}>
                  {traitData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <RTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-bold mb-3">Section scores</h3>
        <div className="glass-card divide-y divide-border">
          {result.sectionScores.map((s) => {
            const fitTone = s.fit === "Strong" ? "bg-success/15 text-success border-success/40"
                         : s.fit === "Moderate" ? "bg-primary/15 text-primary border-primary/40"
                         : "bg-destructive/15 text-destructive border-destructive/40";
            return (
              <div key={s.section} className="p-4 flex items-center gap-4">
                <span className="h-7 w-7 rounded-lg btn-gold text-xs flex items-center justify-center">{s.section}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{s.title}</p>
                  <div className="mt-1.5 h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
                    <div className="h-full btn-gold" style={{ width: `${s.score}%` }} />
                  </div>
                </div>
                <span className="text-sm font-bold w-10 text-right">{s.score}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${fitTone}`}>{s.fit}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-bold mb-3">Career fit</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.careerFit.primary.map((c) => <CareerCard key={c.title} item={c} tier="primary" />)}
          {result.careerFit.secondary.map((c) => <CareerCard key={c.title} item={c} tier="secondary" />)}
        </div>
      </section>

      {result.contradictionFlags.length > 0 && (
        <section>
          <h3 className="text-lg font-bold mb-3">Contradiction flags</h3>
          <div className="space-y-3">
            {result.contradictionFlags.map((f, i) => (
              <div key={i} className="rounded-xl border border-destructive/40 border-l-4 bg-destructive/5 p-4">
                <p className="text-sm font-semibold">{f.area}</p>
                <p className="text-sm text-muted-foreground mt-1">{f.note}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="rounded-2xl border-2 border-primary/50 bg-background/40 p-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">AI advisor summary</p>
          <p className="italic text-base leading-relaxed">{result.aiSummary}</p>
        </div>
      </section>
    </div>
  );
};

export default ResultDashboard;
