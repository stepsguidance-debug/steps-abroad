import { useEffect, useMemo, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/apiClient";
import type { Question } from "@/lib/types";

const QuestionBank = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  useEffect(() => { apiClient.getQuestions().then(setQuestions); }, []);

  const grouped = useMemo(() => {
    const m = new Map<string, { title: string; items: Question[] }>();
    questions.forEach((q) => {
      const g = m.get(q.section) ?? { title: q.sectionTitle, items: [] };
      g.items.push(q);
      m.set(q.section, g);
    });
    return Array.from(m.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [questions]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Question Bank</h2>
        <p className="text-sm text-muted-foreground">{questions.length} questions across {grouped.length} sections.</p>
      </div>

      <div className="glass-card p-2">
        <Accordion type="multiple" className="px-2">
          {grouped.map(([key, g]) => (
            <AccordionItem key={key} value={key} className="border-border">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-3">
                  <span className="h-7 w-7 rounded-lg btn-gold text-xs flex items-center justify-center">{key}</span>
                  <span className="font-semibold">{g.title}</span>
                  <Badge variant="outline" className="ml-2">{g.items.length}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-10">
                  {g.items.map((q, i) => (
                    <div key={q._id} className="rounded-xl border border-border bg-background/30 p-3">
                      <p className="text-sm">
                        <span className="text-muted-foreground mr-2">{i + 1}.</span>{q.text}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                        {q.type === "scale" ? "1–5 scale" : q.type === "mcq" ? "Multiple choice" : "Forced choice"}
                      </p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default QuestionBank;
