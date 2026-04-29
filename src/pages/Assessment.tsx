import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { toast } from "@/hooks/use-toast";
import type { Question } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";

const Assessment = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.role === "student" && user.status === "answered") {
      navigate("/results", { replace: true });
      return;
    }
    apiClient.getQuestions().then(setQuestions);
  }, [navigate, user]);

  const total = questions.length;
  const q = questions[idx];
  const progress = total ? Math.round(((idx + 1) / total) * 100) : 0;
  const sectionsPassed = useMemo(
    () => Array.from(new Set(questions.slice(0, idx + 1).map((question) => question.section))).length,
    [questions, idx],
  );

  const setAnswer = (value: string) => {
    if (!q) return;
    setAnswers((prev) => ({ ...prev, [q._id]: value }));
  };

  const next = () => {
    if (!q || answers[q._id] === undefined) {
      toast({ title: "Please answer to continue", variant: "destructive" });
      return;
    }
    const selectedChoice = q.choices.find((choice) => choice.value === answers[q._id]);
    if (selectedChoice?.allowCustomInput && !customAnswers[q._id]?.trim()) {
      toast({ title: "Please type your own answer to continue", variant: "destructive" });
      return;
    }
    if (idx < total - 1) setIdx(idx + 1);
    else void submit();
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const payload = Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        value,
        customAnswer: customAnswers[questionId]?.trim() || undefined,
      }));
      await apiClient.submitResponses(payload);
      navigate("/results", { replace: true });
    } catch (error) {
      toast({ title: "Submission failed", description: error instanceof Error ? error.message : "", variant: "destructive" });
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

      <div className="max-w-3xl mx-auto w-full">
        <header className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
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

        <div className="glass-card p-5 sm:p-7">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-7 w-7 rounded-lg btn-gold text-xs flex items-center justify-center">{q.section}</span>
            <span className="text-xs uppercase tracking-wider text-muted-foreground">{q.sectionTitle} · {q.layer}</span>
          </div>

          <p className="text-lg font-medium leading-relaxed">{q.questionText}</p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-2">
            {q.choices.map((choice) => {
              const selected = answers[q._id] === choice.value;
              return (
                <div key={choice.value} className="space-y-2">
                  <button onClick={() => setAnswer(choice.value)}
                    className={`w-full text-left rounded-xl border p-3 text-sm transition-all ${
                      selected ? "btn-gold border-transparent" : "border-border hover:border-primary/50"
                    }`}>
                    {choice.label}
                  </button>
                  {selected && choice.allowCustomInput && (
                    <input
                      type="text"
                      value={customAnswers[q._id] || ""}
                      onChange={(e) => setCustomAnswers((prev) => ({ ...prev, [q._id]: e.target.value }))}
                      placeholder={choice.customInputPlaceholder || "Type your answer"}
                      className="w-full rounded-xl border border-border bg-background/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition"
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-7 flex items-center justify-between gap-3">
            <button onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40">
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <button onClick={next} className="btn-gold inline-flex shrink-0 items-center gap-1 px-4 py-2.5 text-sm sm:px-5">
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
