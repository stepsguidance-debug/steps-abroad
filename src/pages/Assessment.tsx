import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { toast } from "@/hooks/use-toast";
import type { Question } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";

const SCALE_LABELS = ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"];

const Assessment = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { apiClient.getQuestions().then(setQuestions); }, []);

  const total = questions.length;
  const q = questions[idx];
  const progress = total ? Math.round(((idx + 1) / total) * 100) : 0;
  const sectionsPassed = useMemo(
    () => Array.from(new Set(questions.slice(0, idx + 1).map((x) => x.section))).length,
    [questions, idx],
  );

  const setAnswer = (val: string | number) => {
    if (!q) return;
    setAnswers((prev) => ({ ...prev, [q._id]: val }));
  };

  const next = () => {
    if (!q || answers[q._id] === undefined) {
      toast({ title: "Please answer to continue", variant: "destructive" });
      return;
    }
    if (idx < total - 1) setIdx(idx + 1);
    else void submit();
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const payload = Object.entries(answers).map(([questionId, value]) => ({ questionId, value }));
      await apiClient.submitResponses(payload);
      navigate("/results", { replace: true });
    } catch (e) {
      toast({ title: "Submission failed", description: e instanceof Error ? e.message : "", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (!q) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading assessment…
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10">
      {submitting && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="h-16 w-16 rounded-full btn-gold flex items-center justify-center animate-pulse">
            <Sparkles className="h-7 w-7" />
          </div>
          <p className="mt-5 text-lg font-semibold">Analysing your profile with AI…</p>
          <p className="text-sm text-muted-foreground mt-1">This usually takes 10–20 seconds.</p>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Steps Guidance · Diagnostic</p>
            <h1 className="text-2xl font-bold">Career Discovery Assessment</h1>
          </div>
          <button onClick={() => { logout(); navigate("/login"); }} className="text-xs text-muted-foreground hover:text-foreground">
            Save & exit
          </button>
        </header>

        <div className="glass-card p-3 mb-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Question {idx + 1} of {total} · {sectionsPassed} of 7 sections</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
            <div className="h-full btn-gold transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="glass-card p-7">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-7 w-7 rounded-lg btn-gold text-xs flex items-center justify-center">{q.section}</span>
            <span className="text-xs uppercase tracking-wider text-muted-foreground">{q.sectionTitle}</span>
          </div>

          <p className="text-lg font-medium leading-relaxed">{q.text}</p>

          <div className="mt-6 space-y-2">
            {q.type === "scale" ? (
              <div className="grid grid-cols-5 gap-2">
                {SCALE_LABELS.map((label, i) => {
                  const value = i + 1;
                  const selected = answers[q._id] === value;
                  return (
                    <button key={value} onClick={() => setAnswer(value)}
                      className={`rounded-xl border p-3 text-center text-xs transition-all ${
                        selected ? "btn-gold border-transparent" : "border-border hover:border-primary/50 text-muted-foreground"
                      }`}>
                      <span className="block text-base font-bold">{value}</span>
                      <span className="block mt-1">{label}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              (q.options ?? []).map((opt) => {
                const selected = answers[q._id] === opt;
                return (
                  <button key={opt} onClick={() => setAnswer(opt)}
                    className={`w-full text-left rounded-xl border p-3 text-sm transition-all ${
                      selected ? "btn-gold border-transparent" : "border-border hover:border-primary/50"
                    }`}>
                    {opt}
                  </button>
                );
              })
            )}
          </div>

          <div className="mt-7 flex items-center justify-between">
            <button onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40">
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <button onClick={next} className="btn-gold inline-flex items-center gap-1 px-5 py-2.5 text-sm">
              {idx === total - 1 ? "Submit assessment" : "Next"}
              {idx !== total - 1 && <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assessment;
