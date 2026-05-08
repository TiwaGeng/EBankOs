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
import { Plus, Wallet } from "lucide-react";
import { toast } from "sonner";

interface Client { id: string; full_name: string; }
interface Loan { id: string; client_id: string; principal: number; interest_rate: number; fine: number; term_months: number; status: string; given_at: string; due_at: string | null; notes: string | null; clients?: { full_name: string } | null; }

const parsePerPeriod = (notes: string | null): { schedule: "daily" | "weekly"; amount: number } | null => {
  if (!notes) return null;
  const sch = /schedule:(daily|weekly)/.exec(notes)?.[1] as "daily" | "weekly" | undefined;
  const m = /per_(day|week):([0-9.]+)/.exec(notes);
  if (!sch || !m) return null;
  return { schedule: sch, amount: Number(m[2]) };
};

const schema = z.object({
  client_id: z.string().uuid(),
  principal: z.coerce.number().positive().max(1e10),
  interest_rate: z.coerce.number().min(0).max(100),
  term_months: z.coerce.number().int().min(1).max(360),
});

const Loans = () => {
  const { user, hasRole } = useAuth();
  const canEdit = hasRole(["admin", "loan_officer"]);
  const canPay = hasRole(["admin", "loan_officer", "accountant"]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [open, setOpen] = useState(false);
  const [clientId, setClientId] = useState("");
  const [paidMap, setPaidMap] = useState<Record<string, number>>({});
  const [payOpen, setPayOpen] = useState(false);
  const [payLoan, setPayLoan] = useState<Loan | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<string>("cash");

  const load = async () => {
    const { data, error } = await supabase
      .from("loans")
      .select("*, clients(full_name)")
      .in("status", ["active", "overdue"])
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else {
      // Show only the latest active loan per client
      const seen = new Set<string>();
      const unique = ((data ?? []) as Loan[]).filter((l) => {
        if (seen.has(l.client_id)) return false;
        seen.add(l.client_id);
        return true;
      });
      setLoans(unique);
    }
    const { data: cs } = await supabase.from("clients").select("id, full_name").order("full_name");
    setClients(cs ?? []);
    const { data: pays } = await supabase.from("payments").select("loan_id, amount");
    const m: Record<string, number> = {};
    (pays ?? []).forEach((p) => { m[p.loan_id] = (m[p.loan_id] || 0) + Number(p.amount); });
    setPaidMap(m);
  };
  useEffect(() => { load(); }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = schema.safeParse({ ...fd, client_id: clientId });
    if (!parsed.success) return toast.error(parsed.error.errors[0].message);
    const { data: existing } = await supabase.from("loans").select("id").eq("client_id", parsed.data.client_id).in("status", ["active", "overdue"]).limit(1);
    if (existing && existing.length > 0) return toast.error("This client already has an active loan. Renew it instead.");
    const due = new Date(); due.setMonth(due.getMonth() + parsed.data.term_months);
    const payload = {
      ...parsed.data,
      status: "active" as const,
      given_at: new Date().toISOString().slice(0, 10),
      due_at: due.toISOString().slice(0, 10),
      created_by: user!.id,
    } as never;
    const { error } = await supabase.from("loans").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Loan created");
    setOpen(false); setClientId("");
    load();
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("loans").update({ status: status as "active" | "completed" | "overdue" | "renewed" }).eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  const totalDue = (l: Loan) => Number(l.principal) * (1 + Number(l.interest_rate || 0) / 100) + Number(l.fine || 0);
  const computedStatus = (l: Loan, paid: number): string => {
    if (l.status === "renewed") return "renewed";
    if (paid >= totalDue(l) - 0.01) return "completed";
    const today = new Date().toISOString().slice(0, 10);
    if (l.due_at && l.due_at < today) return "overdue";
    return "active";
  };

  const openPay = (l: Loan) => {
    setPayLoan(l);
    const pp = parsePerPeriod(l.notes);
    const remaining = Math.max(0, totalDue(l) - (paidMap[l.id] || 0));
    const suggested = pp ? Math.min(pp.amount, remaining) : 0;
    setPayAmount(Number(suggested.toFixed(2)));
    setPayMethod("cash");
    setPayOpen(true);
  };
  const submitPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payLoan || payAmount <= 0) return toast.error("Enter an amount");
    const { error } = await supabase.from("payments").insert({ loan_id: payLoan.id, amount: payAmount, method: payMethod, created_by: user!.id } as never);
    if (error) return toast.error(error.message);
    const newPaid = (paidMap[payLoan.id] || 0) + payAmount;
    if (newPaid >= totalDue(payLoan) - 0.01 && payLoan.status !== "completed") {
      await supabase.from("loans").update({ status: "completed" as const }).eq("id", payLoan.id);
    }
    toast.success("Payment recorded");
    setPayOpen(false); setPayLoan(null); load();
  };

  const variant = (s: string): "default" | "secondary" | "destructive" | "outline" =>
    s === "active" ? "default" : s === "completed" ? "secondary" : s === "overdue" ? "destructive" : "outline";

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Loans</h1>
          <p className="text-muted-foreground">{loans.length} total</p>
        </div>
        {canEdit && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Give Loan</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Loan</DialogTitle></DialogHeader>
              <form onSubmit={onSubmit} className="space-y-3">
                <div>
                  <Label>Client</Label>
                  <Select value={clientId} onValueChange={setClientId}>
                    <SelectTrigger><SelectValue placeholder="Pick a client" /></SelectTrigger>
                    <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label>Principal</Label><Input name="principal" type="number" step="0.01" required /></div>
                  <div><Label>Interest %</Label><Input name="interest_rate" type="number" step="0.01" defaultValue={0} /></div>
                  <div><Label>Months</Label><Input name="term_months" type="number" defaultValue={1} required /></div>
                </div>
                <Button type="submit" className="w-full">Save</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </header>
      <div className="bg-card border rounded-xl shadow-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow><TableHead>Client</TableHead><TableHead>Principal</TableHead><TableHead>Rate</TableHead><TableHead>Daily payment</TableHead><TableHead>Due date</TableHead><TableHead>Total paid</TableHead><TableHead>Remaining</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {loans.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-10">No loans yet</TableCell></TableRow>
            ) : loans.map((l) => {
              const paid = paidMap[l.id] || 0;
              const remaining = Math.max(0, totalDue(l) - paid);
              const status = computedStatus(l, paid);
              const pp = parsePerPeriod(l.notes);
              return (
              <TableRow key={l.id}>
                <TableCell className="font-medium">{l.clients?.full_name ?? "—"}</TableCell>
                <TableCell>{Number(l.principal).toLocaleString()}</TableCell>
                <TableCell>{l.interest_rate}%</TableCell>
                <TableCell>{pp ? `${pp.amount.toLocaleString(undefined,{maximumFractionDigits:2})} / ${pp.schedule === "daily" ? "day" : "wk"}` : "—"}</TableCell>
                <TableCell>{l.due_at ?? "—"}</TableCell>
                <TableCell>{paid.toLocaleString()}</TableCell>
                <TableCell className="font-semibold">{remaining.toLocaleString()}</TableCell>
                <TableCell>
                  {canEdit && status !== "completed" ? (
                    <Select value={l.status} onValueChange={(v) => updateStatus(l.id, v)}>
                      <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                        <SelectItem value="renewed">Renewed</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : <Badge variant={variant(status)}>{status}</Badge>}
                </TableCell>
                <TableCell className="text-right">
                  {canPay && status !== "completed" && status !== "renewed" && (
                    <Button size="sm" variant="outline" onClick={() => openPay(l)}><Wallet className="h-4 w-4 mr-1" /> Pay</Button>
                  )}
                </TableCell>
              </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record payment{payLoan?.clients?.full_name ? ` — ${payLoan.clients.full_name}` : ""}</DialogTitle></DialogHeader>
          {payLoan && (
            <form onSubmit={submitPay} className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Total due: <strong>{totalDue(payLoan).toLocaleString()}</strong> · Already paid: <strong>{(paidMap[payLoan.id] || 0).toLocaleString()}</strong>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Amount</Label><Input type="number" step="0.01" value={payAmount || ""} onChange={(e) => setPayAmount(Number(e.target.value))} required /></div>
                <div>
                  <Label>Method</Label>
                  <Select value={payMethod} onValueChange={setPayMethod}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank">Bank</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full">Save payment</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Loans;