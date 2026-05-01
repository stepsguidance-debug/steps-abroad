import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ResultDashboard from "@/components/ResultDashboard";
import { apiClient } from "@/lib/apiClient";
import type { Result } from "@/lib/types";

const StudentResult = () => {
  const { userId = "" } = useParams();
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { apiClient.getResult(userId).then((r) => { setResult(r); setLoading(false); }); }, [userId]);

  return (
    <div className="space-y-6">
      <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to overview
      </Link>
      {loading ? <p className="text-muted-foreground">Loading…</p>
        : result ? <ResultDashboard result={result} />
        : <p className="text-muted-foreground">No result found for this student.</p>}
    </div>
  );
};

export default StudentResult;
