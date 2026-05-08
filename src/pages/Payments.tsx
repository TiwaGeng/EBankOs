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
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface Loan { id: string; principal: number; clients?: { full_name: string } | null; }
interface Payment { id: string; amount: number; method: string; paid_at: string; loans?: { clients?: { full_name: string } | null } | null; }

const schema = z.object({ loan_id: z.string().uuid(), amount: z.coerce.number().positive(), method: z.string().min(1) });

const Payments = () => {
  const { user, hasRole } = useAuth();
  const canPay = hasRole(["admin", "loan_officer", "accountant"]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [open, setOpen] = useState(false);
  const [loanId, setLoanId] = useState("");
  const [method, setMethod] = useState("cash");

  const load = async () => {
    const { data: ls } = await supabase.from("loans").select("id, principal, clients(full_name)").in("status", ["active", "overdue", "renewed"]);
    setLoans((ls ?? []) as Loan[]);
    const { data: ps } = await supabase.from("payments").select("*, loans(clients(full_name))").order("paid_at", { ascending: false }).limit(200);
    setPayments((ps ?? []) as Payment[]);
  };
  useEffect(() => { load(); }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = schema.safeParse({ ...fd, loan_id: loanId, method });
    if (!parsed.success) return toast.error(parsed.error.errors[0].message);
    const { error } = await supabase.from("payments").insert({ ...parsed.data, created_by: user!.id } as never);
    if (error) return toast.error(error.message);
    toast.success("Payment recorded");
    setOpen(false); setLoanId("");
    load();
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground">{payments.length} recorded</p>
        </div>
        {canPay && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Record Payment</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Payment</DialogTitle></DialogHeader>
              <form onSubmit={onSubmit} className="space-y-3">
                <div>
                  <Label>Loan</Label>
                  <Select value={loanId} onValueChange={setLoanId}>
                    <SelectTrigger><SelectValue placeholder="Pick a loan" /></SelectTrigger>
                    <SelectContent>{loans.map((l) => <SelectItem key={l.id} value={l.id}>{l.clients?.full_name} — {Number(l.principal).toLocaleString()}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Amount</Label><Input name="amount" type="number" step="0.01" required /></div>
                  <div>
                    <Label>Method</Label>
                    <Select value={method} onValueChange={setMethod}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bank">Bank</SelectItem>
                        <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full">Save</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </header>
      <div className="bg-card border rounded-xl shadow-soft overflow-hidden">
        <Table>
          <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Client</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead></TableRow></TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-10">No payments yet</TableCell></TableRow>
            ) : payments.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.paid_at}</TableCell>
                <TableCell className="font-medium">{p.loans?.clients?.full_name ?? "—"}</TableCell>
                <TableCell>{Number(p.amount).toLocaleString()}</TableCell>
                <TableCell className="capitalize">{p.method.replace("_", " ")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Payments;