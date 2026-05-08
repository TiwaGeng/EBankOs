import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface Tx { id: string; type: "income" | "expense"; category: string; amount: number; description: string | null; occurred_at: string; }

const schema = z.object({
  type: z.enum(["income", "expense"]),
  category: z.string().trim().min(1).max(60),
  amount: z.coerce.number().positive(),
  description: z.string().trim().max(300).optional().or(z.literal("")),
});

const Transactions = () => {
  const { user, hasRole } = useAuth();
  const canEdit = hasRole(["admin", "accountant"]);
  const [items, setItems] = useState<Tx[]>([]);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"income" | "expense">("income");

  const load = async () => {
    const { data, error } = await supabase.from("transactions").select("*").order("occurred_at", { ascending: false }).limit(300);
    if (error) return toast.error(error.message);
    setItems((data ?? []) as Tx[]);
  };
  useEffect(() => { load(); }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = schema.safeParse({ ...fd, type });
    if (!parsed.success) return toast.error(parsed.error.errors[0].message);
    const { error } = await supabase.from("transactions").insert({ ...parsed.data, created_by: user!.id } as never);
    if (error) return toast.error(error.message);
    toast.success("Saved"); setOpen(false); load();
  };

  const totals = items.reduce((acc, t) => { acc[t.type] += Number(t.amount); return acc; }, { income: 0, expense: 0 });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">Income {totals.income.toLocaleString()} · Expenses {totals.expense.toLocaleString()} · Net <span className="text-gold font-semibold">{(totals.income - totals.expense).toLocaleString()}</span></p>
        </div>
        {canEdit && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Add Entry</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Transaction</DialogTitle></DialogHeader>
              <form onSubmit={onSubmit} className="space-y-3">
                <div>
                  <Label>Type</Label>
                  <Select value={type} onValueChange={(v) => setType(v as "income" | "expense")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Category</Label><Input name="category" required /></div>
                  <div><Label>Amount</Label><Input name="amount" type="number" step="0.01" required /></div>
                </div>
                <div><Label>Description</Label><Input name="description" /></div>
                <Button type="submit" className="w-full">Save</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </header>
      <div className="bg-card border rounded-xl shadow-soft overflow-hidden">
        <Table>
          <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Category</TableHead><TableHead>Amount</TableHead><TableHead>Description</TableHead></TableRow></TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-10">No transactions yet</TableCell></TableRow>
            ) : items.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{t.occurred_at}</TableCell>
                <TableCell><Badge variant={t.type === "income" ? "default" : "destructive"}>{t.type}</Badge></TableCell>
                <TableCell>{t.category}</TableCell>
                <TableCell className="font-medium">{Number(t.amount).toLocaleString()}</TableCell>
                <TableCell className="text-muted-foreground">{t.description || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Transactions;