import { useEffect, useState } from "react";
import { Download, Plus, Trash2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import { downloadResultDashboardPdf } from "@/lib/resultPdfExport";
import { validateStrictGmail } from "@/lib/gmail";
import type { Student } from "@/lib/types";

const ManageUsers = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [toDelete, setToDelete] = useState<Student | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await apiClient.getStudents();
      setStudents(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load students");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { refresh(); }, []);

  const handleAdd = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    const gmail = validateStrictGmail(form.email);
    if (!gmail.ok) {
      toast({ title: "Invalid email", description: gmail.error, variant: "destructive" });
      return;
    }

    try {
      setCreating(true);
      await apiClient.addStudent({ ...form, email: gmail.normalized });
      await refresh();
      toast({ title: "Student added" });
      setForm({ name: "", email: "", password: "" });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Unable to create student",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      setDeleting(true);
      await apiClient.deleteStudent(toDelete._id);
      await refresh();
      toast({ title: `${toDelete.name} removed` });
      setToDelete(null);
    } catch (error) {
      toast({
        title: "Unable to remove student",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const downloadPdf = async (s: Student) => {
    try {
      const data = await apiClient.getResult(s._id);
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
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold">Manage Users</h2>
          <p className="text-sm text-muted-foreground">
            Add, view and remove student accounts. Student email must be a valid <span className="font-medium text-foreground">@gmail.com</span> address.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button type="button" className="btn-gold w-full sm:w-auto"><Plus className="h-4 w-4 mr-1" /> Add Student</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add a new student</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-3">
                <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div>
                  <Label>Email (@gmail.com only)</Label>
                  <Input type="email" autoComplete="off" placeholder="name@gmail.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div><Label>Temporary password</Label><Input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={creating}>Cancel</Button>
                <Button type="submit" className="btn-gold" disabled={creating}>
                  {creating ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loadError ? (
        <div className="glass-card p-6 text-sm">
          <p className="font-semibold text-destructive">Couldn't load students</p>
          <p className="text-muted-foreground mt-1">{loadError}</p>
          <Button className="mt-3" variant="outline" onClick={refresh}>Retry</Button>
        </div>
      ) : loading ? (
        <div className="glass-card p-6 text-sm text-muted-foreground">Loading students…</div>
      ) : students.length === 0 ? (
        <div className="glass-card p-8 text-center text-sm text-muted-foreground">
          No students yet. Create one using the <span className="font-medium text-foreground">Add Student</span> button.
        </div>
      ) : (
      <div className="glass-card overflow-hidden">
        <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[40rem] text-sm">
          <thead className="bg-secondary/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">AI Readiness</th>
              <th className="px-5 py-3 text-right">PDF</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id} className="border-t border-border">
                <td className="px-5 py-3 font-medium">{s.name}</td>
                <td className="px-5 py-3 text-muted-foreground">{s.email}</td>
                <td className="px-5 py-3 capitalize">{s.status.replace("_", " ")}</td>
                <td className="px-5 py-3 text-right">{s.aiReadiness != null ? `${s.aiReadiness}%` : "—"}</td>
                <td className="px-5 py-3 text-right">
                  {s.status === "answered" ? (
                    <Button variant="outline" size="sm" className="gap-1" title="Download result PDF" onClick={() => void downloadPdf(s)}>
                      <Download className="h-4 w-4" />
                      PDF
                    </Button>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  <Button variant="ghost" size="icon" onClick={() => setToDelete(s)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
      )}

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {toDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>This permanently deletes their account and assessment.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageUsers;
