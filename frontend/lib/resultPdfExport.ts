import { pdf } from "@react-pdf/renderer";
import { createElement } from "react";
import ResultPdfDocument from "@/lib/ResultPdfDocument";
import type { Result } from "@/lib/types";

function sanitizeFilename(name: string): string {
  const s = String(name || "student")
    .replace(/[^\w\-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  return (s || "student").slice(0, 72);
}

/**
 * Vector PDF: real text, Svg paths, structured pages (no html2canvas snapshots).
 */
export async function downloadResultDashboardPdf(result: Result): Promise<void> {
  await document.fonts.ready;
  const doc = createElement(ResultPdfDocument, { result });
  const blob = await pdf(doc).toBlob();

  const filename = `Steps-Guidance-${sanitizeFilename(result.userName)}.pdf`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
