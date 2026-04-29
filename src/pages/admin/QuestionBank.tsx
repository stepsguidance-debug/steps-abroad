import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import type { NewQuestionInput, Question, QuestionChoice } from "@/lib/types";

const emptyChoice = (): QuestionChoice => ({
  label: "",
  value: "",
  allowCustomInput: false,
  customInputPlaceholder: "",
  weights: { analytical: 5, creative: 5, applied: 5, social: 5, aiReadiness: 5 },
});

const defaultForm = (): NewQuestionInput => ({
  section: "A",
  questionText: "",
  type: "mcq",
  layer: "L1",
  choices: [emptyChoice(), emptyChoice(), emptyChoice()],
});

const QuestionBank = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<NewQuestionInput>(defaultForm());

  const refresh = () => apiClient.getQuestions().then(setQuestions);
  useEffect(() => { refresh(); }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, { title: string; items: Question[] }>();
    questions.forEach((question) => {
      const group = map.get(question.section) ?? { title: question.sectionTitle, items: [] };
      group.items.push(question);
      map.set(question.section, group);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [questions]);

  const updateChoice = (index: number, patch: Partial<QuestionChoice>) => {
    setForm((prev) => ({
      ...prev,
      choices: prev.choices.map((choice, choiceIndex) => (
        choiceIndex === index ? { ...choice, ...patch } : choice
      )),
    }));
  };

  const addChoice = () => {
    setForm((prev) => ({ ...prev, choices: [...prev.choices, emptyChoice()] }));
  };

  const createQuestion = async () => {
    await apiClient.addQuestion({
      ...form,
      choices: form.choices.map((choice) => ({
        ...choice,
        value: choice.value || choice.label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, ""),
      })),
    });
    toast({ title: "Question created" });
    setOpen(false);
    setForm(defaultForm());
    refresh();
  };

  const removeQuestion = async (questionId: string) => {
    await apiClient.deleteQuestion(questionId);
    toast({ title: "Question deleted" });
    refresh();
  };

  const removeOption = async (questionId: string, optionValue: string) => {
    await apiClient.deleteQuestionOption(questionId, optionValue);
    toast({ title: "Option deleted" });
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold">Question Bank</h2>
          <p className="text-sm text-muted-foreground">{questions.length} questions across {grouped.length} sections.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gold w-full sm:w-auto"><Plus className="h-4 w-4 mr-1" /> Add Question</Button>
          </DialogTrigger>
          <DialogContent className="w-[calc(100vw-1rem)] max-w-3xl p-0 sm:w-[calc(100vw-2rem)]">
            <DialogHeader>
              <div className="border-b border-border px-4 py-4 sm:px-6">
                <DialogTitle>Create a question</DialogTitle>
              </div>
            </DialogHeader>
            <div className="max-h-[75vh] overflow-y-auto px-4 py-4 sm:px-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>Section</Label>
                  <select value={form.section} onChange={(e) => setForm((prev) => ({ ...prev, section: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-border bg-background/40 px-4 py-3 text-sm">
                    {["A", "B", "C", "D", "E", "F", "G"].map((section) => <option key={section} value={section}>{section}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Layer</Label>
                  <select value={form.layer} onChange={(e) => setForm((prev) => ({ ...prev, layer: e.target.value as NewQuestionInput["layer"] }))}
                    className="mt-1 w-full rounded-xl border border-border bg-background/40 px-4 py-3 text-sm">
                    {["L1", "L2", "L3", "L4", "L5"].map((layer) => <option key={layer} value={layer}>{layer}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <Label>Question text</Label>
                  <Input className="mt-1" value={form.questionText} onChange={(e) => setForm((prev) => ({ ...prev, questionText: e.target.value }))} />
                </div>
                <div className="sm:col-span-2 md:max-w-xs">
                  <Label>Type</Label>
                  <select value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as NewQuestionInput["type"] }))}
                    className="mt-1 w-full rounded-xl border border-border bg-background/40 px-4 py-3 text-sm">
                    <option value="mcq">Multiple choice</option>
                    <option value="forced-choice">Forced choice</option>
                    <option value="scale">Scale</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Label>Options</Label>
                    <p className="text-xs text-muted-foreground">Add fixed options, or enable one option to accept a custom typed answer.</p>
                  </div>
                  <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={addChoice}>Add option</Button>
                </div>
                {form.choices.map((choice, index) => (
                  <div key={index} className="rounded-xl border border-border p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">Option {index + 1}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <Label>Option label</Label>
                        <Input className="mt-1" value={choice.label} onChange={(e) => updateChoice(index, { label: e.target.value })} placeholder="Instagram" />
                      </div>
                      <div>
                        <Label>Option value</Label>
                        <Input className="mt-1" value={choice.value} onChange={(e) => updateChoice(index, { value: e.target.value })} placeholder="auto-generated if blank" />
                        <p className="mt-1 text-xs text-muted-foreground">Internal ID used by the app. You can leave this blank.</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 rounded-lg bg-secondary/30 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">Allow user to provide own answer</p>
                        <p className="text-xs text-muted-foreground">Example: “Other (please type here)” and save the typed value like TikTok.</p>
                      </div>
                      <Switch checked={!!choice.allowCustomInput} onCheckedChange={(checked) => updateChoice(index, { allowCustomInput: checked })} />
                    </div>
                    {choice.allowCustomInput && (
                      <div>
                        <Label>Custom input placeholder</Label>
                        <Input className="mt-1" value={choice.customInputPlaceholder || ""} onChange={(e) => updateChoice(index, { customInputPlaceholder: e.target.value })} placeholder="Type your source here" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="border-t border-border px-4 py-4 sm:px-6">
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button className="btn-gold" onClick={createQuestion}>Create question</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="glass-card p-2">
        <Accordion type="multiple" className="px-2">
          {grouped.map(([key, group]) => (
            <AccordionItem key={key} value={key} className="border-border">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-3">
                  <span className="h-7 w-7 rounded-lg btn-gold text-xs flex items-center justify-center">{key}</span>
                  <span className="font-semibold">{group.title}</span>
                  <Badge variant="outline" className="ml-2">{group.items.length}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pl-0 sm:pl-10">
                  {group.items.map((question, index) => (
                    <div key={question._id} className="rounded-xl border border-border bg-background/30 p-4 space-y-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-sm">
                            <span className="text-muted-foreground mr-2">{index + 1}.</span>{question.questionText}
                          </p>
                          <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                            {question.type === "scale" ? "Scale" : question.type === "mcq" ? "Multiple choice" : "Forced choice"} · {question.layer}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeQuestion(question._id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {question.choices.map((choice) => (
                          <div key={choice.value} className="flex flex-col gap-2 rounded-lg border border-border px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <p className="text-sm">{choice.label}</p>
                              {choice.allowCustomInput && (
                                <p className="text-xs text-muted-foreground">
                                  Own answer enabled
                                  {choice.customInputPlaceholder ? ` · ${choice.customInputPlaceholder}` : ""}
                                </p>
                              )}
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeOption(question._id, choice.value)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
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
