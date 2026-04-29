import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, GraduationCap } from "lucide-react";
import ResultDashboard from "@/components/ResultDashboard";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";
import type { Result } from "@/lib/types";

const Results = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    apiClient.getResult(user._id).then((r) => { setResult(r); setLoading(false); });
  }, [user]);

  return (
    <div className="min-h-screen">
      <header className="border-b border-border px-4 py-4 sm:px-6 lg:px-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl btn-gold flex items-center justify-center"><GraduationCap className="h-5 w-5" /></div>
          <p className="font-bold"><span className="gold-text">Steps</span> Guidance</p>
        </div>
        <button onClick={() => { logout(); navigate("/login"); }}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </header>
      <main className="max-w-5xl mx-auto w-full px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        {loading ? <p className="text-muted-foreground">Loading your results…</p>
          : result ? <ResultDashboard result={result} />
          : <p className="text-muted-foreground">No result yet — please complete the assessment.</p>}
      </main>
    </div>
  );
};

export default Results;
