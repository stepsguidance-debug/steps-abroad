import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ChevronLeft, ChevronRight, Sparkles, GraduationCap, RefreshCw } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { toast } from "@/hooks/use-toast";
import type { Question } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import UserBadge from "@/components/UserBadge";

interface SavedProgress {
  userId: string;
  currentSection: string;
  currentQuestionIndex: number;
  answers: Record<string, { selectedValue: string; selectedLabel: string; customAnswer?: string }>;
  savedAt: string;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const Assessment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const storageKey = user ? `assessment_progress_${user._id}` : "";

  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [resumeOffer, setResumeOffer] = useState<SavedProgress | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [queueStatus, setQueueStatus] = useState<{ position: number; isProcessing: boolean } | null>(null);

  const labelByValue = useRef<Map<string, Map<string, string>>>(new Map());

  useEffect(() => {
    if (user?.role === "student" && user.status === "answered") {
      navigate("/results", { replace: true });
      return;
    }
    apiClient.getQuestions().then((qs) => {
      setQuestions(qs);
      const map = new Map<string, Map<string, string>>();
      qs.forEach((q) => {
        const m = new Map<string, string>();
        q.choices.forEach((c) => m.set(c.value, c.label));
        map.set(q._id, m);
      });
      labelByValue.current = map;
    });
  }, [navigate, user]);

  // Hydrate from localStorage / server draft once questions are loaded
  useEffect(() => {
    if (!user || !questions.length || hydrated) return;
    let saved: SavedProgress | null = null;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedProgress;
        const age = Date.now() - new Date(parsed.savedAt).getTime();
        if (age < SEVEN_DAYS_MS && parsed.userId === user._id) {
          saved = parsed;
        } else {
          localStorage.removeItem(storageKey);
        }
      }
    } catch {
      localStorage.removeItem(storageKey);
    }

    if (saved) {
      setResumeOffer(saved);
      setHydrated(true);
      return;
    }

    // Try server draft
    apiClient.getDraft().then((draft) => {
      if (draft?.answers?.length) {
        const ans: Record<string, string> = {};
        const custom: Record<string, string> = {};
        draft.answers.forEach((a) => {
          ans[a.questionId] = a.selectedValue;
          if (a.customAnswer) custom[a.questionId] = a.customAnswer;
        });
        setAnswers(ans);
        setCustomAnswers(custom);
        const lastIdx = Math.min(draft.answers.length, questions.length - 1);
        setIdx(lastIdx);
      }
      setHydrated(true);
    }).catch(() => setHydrated(true));
  }, [user, questions, hydrated, storageKey]);

  const total = questions.length;
  const q = questions[idx];
  const progress = total ? Math.round(((idx + 1) / total) * 100) : 0;
  const sectionsPassed = useMemo(
    () => Array.from(new Set(questions.slice(0, idx + 1).map((question) => question.section))).length,
    [questions, idx],
  );

  const persistProgress = (
    nextAnswers: Record<string, string>,
    nextCustom: Record<string, string>,
    nextIdx: number,
  ) => {
    if (!user || !storageKey) return;
    const answersMap: SavedProgress["answers"] = {};
    Object.entries(nextAnswers).forEach(([qid, value]) => {
      const label = labelByValue.current.get(qid)?.get(value) || value;
      answersMap[qid] = { selectedValue: value, selectedLabel: label, customAnswer: nextCustom[qid] };
    });
    const payload: SavedProgress = {
      userId: user._id,
      currentSection: questions[nextIdx]?.section || "A",
      currentQuestionIndex: nextIdx,
      answers: answersMap,
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch { /* quota */ }
  };

  const setAnswer = (value: string) => {
    if (!q) return;
    const next = { ...answers, [q._id]: value };
    setAnswers(next);
    persistProgress(next, customAnswers, idx);
  };

  const setCustomAnswer = (value: string) => {
    if (!q) return;
    const next = { ...customAnswers, [q._id]: value };
    setCustomAnswers(next);
    persistProgress(answers, next, idx);
  };

  const next = async () => {
    if (!q || answers[q._id] === undefined) {
      toast({ title: "Please answer to continue", variant: "destructive" });
      return;
    }
    const selectedChoice = q.choices.find((choice) => choice.value === answers[q._id]);
    if (selectedChoice?.allowCustomInput && !customAnswers[q._id]?.trim()) {
      toast({ title: "Please type your own answer to continue", variant: "destructive" });
      return;
    }

    // Best-effort backend draft
    const draftPayload = Object.entries(answers).map(([questionId, value]) => ({
      questionId,
      selectedValue: value,
      selectedLabel: labelByValue.current.get(questionId)?.get(value) || value,
      customAnswer: customAnswers[questionId]?.trim() || undefined,
    }));
    void apiClient.saveDraft(draftPayload);

    if (idx < total - 1) {
      const nextIdx = idx + 1;
      setIdx(nextIdx);
      persistProgress(answers, customAnswers, nextIdx);
    } else {
      void submit();
    }
  };

  const submit = async () => {
    setSubmitting(true);
    setQueueStatus({ position: 0, isProcessing: true });
    let pollHandle: number | undefined;
    if (!apiClient.usingMocks) {
      pollHandle = window.setInterval(async () => {
        const status = await apiClient.getQueueStatus();
        setQueueStatus(status);
      }, 5000);
    }
    try {
      const payload = Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        value,
        customAnswer: customAnswers[questionId]?.trim() || undefined,
      }));
      await apiClient.submitResponses(payload);
      // Clear local + server draft on success
      try { localStorage.removeItem(storageKey); } catch {}
      navigate("/results", { replace: true });
    } catch (error) {
      toast({ title: "Submission failed", description: error instanceof Error ? error.message : "", variant: "destructive" });
    } finally {
      if (pollHandle) window.clearInterval(pollHandle);
      setSubmitting(false);
    }
  };

  const continueResume = () => {
    if (!resumeOffer) return;
    const restoredAnswers: Record<string, string> = {};
    const restoredCustom: Record<string, string> = {};
    Object.entries(resumeOffer.answers).forEach(([qid, a]) => {
      restoredAnswers[qid] = a.selectedValue;
      if (a.customAnswer) restoredCustom[qid] = a.customAnswer;
    });
    setAnswers(restoredAnswers);
    setCustomAnswers(restoredCustom);
    setIdx(Math.min(resumeOffer.currentQuestionIndex, Math.max(0, questions.length - 1)));
    setResumeOffer(null);
  };

  const startFresh = () => {
    try { localStorage.removeItem(storageKey); } catch {}
    setAnswers({});
    setCustomAnswers({});
    setIdx(0);
    setResumeOffer(null);
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
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center px-4 text-center">
          <div className="h-16 w-16 rounded-full btn-gold flex items-center justify-center animate-pulse">
            <Sparkles className="h-7 w-7" />
          </div>
          <p className="mt-5 text-lg font-semibold">Analysing your profile with AI…</p>
          <p className="text-sm text-muted-foreground mt-1">This may take up to 60 seconds.</p>
          {queueStatus && queueStatus.position > 0 && (
            <p className="text-sm text-primary mt-3">
              You are number {queueStatus.position} in the queue. Please wait…
            </p>
          )}
        </div>
      )}

      <div className="max-w-3xl mx-auto w-full">
        <header className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl btn-gold flex items-center justify-center shrink-0">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Steps Guidance · Diagnostic</p>
              <h1 className="text-xl sm:text-2xl font-bold truncate">Career Discovery Assessment</h1>
            </div>
          </div>
          <UserBadge />
        </header>

        {resumeOffer && (
          <div className="glass-card p-4 sm:p-5 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm">
              <p className="font-semibold">Resume your previous attempt</p>
              <p className="text-muted-foreground">
                You have a saved attempt from {new Date(resumeOffer.savedAt).toLocaleString()}. Would you like to continue where you left off?
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={continueResume} className="btn-gold inline-flex items-center gap-1 px-4 py-2 text-sm">
                Continue
              </button>
              <button onClick={startFresh}
                className="inline-flex items-center gap-1 rounded-xl border border-border px-4 py-2 text-sm hover:bg-secondary/50">
                <RefreshCw className="h-3.5 w-3.5" /> Start fresh
              </button>
            </div>
          </div>
        )}

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
                      onChange={(e) => setCustomAnswer(e.target.value)}
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
