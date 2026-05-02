import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import ResultDashboard from "@/components/ResultDashboard";
import { apiClient } from "@/lib/apiClient";
import { downloadResultDashboardPdf } from "@/lib/resultPdfExport";
import type { Result } from "@/lib/types";

const StudentResult = () => {
  const { userId = "" } = useParams();
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => { apiClient.getResult(userId).then((r) => { setResult(r); setLoading(false); }); }, [userId]);

  const downloadPdf = async () => {
    try {
      setPdfLoading(true);
      const data = result ?? await apiClient.getResult(userId);
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
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to overview
        </Link>
        {result ? (
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto gap-2"
            disabled={pdfLoading}
            onClick={() => void downloadPdf()}
          >
            <Download className="h-4 w-4" />
            {pdfLoading ? "Preparing PDF…" : "Download PDF"}
          </Button>
        ) : null}
      </div>
      {loading ? <p className="text-muted-foreground">Loading…</p>
        : result ? <ResultDashboard result={result} />
        : <p className="text-muted-foreground">No result found for this student.</p>}
    </div>
  );
};

export default StudentResult;
