import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface Loan { id: string; principal: number; term_months: number; interest_rate: number; fine: number; client_id: string; notes: string | null; created_at: string; clients?: { full_name: string } | null; }

const parsePerPeriod = (notes: string | null): { schedule: "daily" | "weekly"; amount: number } | null => {
  if (!notes) return null;
  const sch = /schedule:(daily|weekly)/.exec(notes)?.[1] as "daily" | "weekly" | undefined;
  const m = /per_(day|week):([0-9.]+)/.exec(notes);
  if (!sch || !m) return null;
  return { schedule: sch, amount: Number(m[2]) };
};

const RenewLoan = () => {
  const { user, hasRole } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loanId, setLoanId] = useState("");
  const [months, setMonths] = useState<number>(1);
  const [paidMap, setPaidMap] = useState<Record<string, number>>({});

  const load = async () => {
    const { data } = await supabase
      .from("loans")
      .select("id, principal, term_months, interest_rate, fine, client_id, notes, created_at, clients(full_name)")
      .in("status", ["active", "overdue"])
      .order("created_at", { ascending: false });
    // Dedupe: keep only the latest active loan per client
    const seen = new Set<string>();
    const unique = ((data ?? []) as Loan[]).filter((l) => {
      if (seen.has(l.client_id)) return false;
      seen.add(l.client_id);
      return true;
    });
    setLoans(unique);
    const ids = unique.map((l) => l.id);
    if (ids.length) {
      const { data: pays } = await supabase.from("payments").select("loan_id, amount").in("loan_id", ids);
      const m: Record<string, number> = {};
      (pays ?? []).forEach((p) => { m[p.loan_id] = (m[p.loan_id] || 0) + Number(p.amount); });
      setPaidMap(m);
    } else setPaidMap({});
  };
  useEffect(() => { load(); }, []);

  if (!hasRole(["admin", "loan_officer"])) return <p className="text-muted-foreground">You don't have permission to renew loans.</p>;

  const remainingFor = (l: Loan) => {
    const total = Number(l.principal) * (1 + Number(l.interest_rate || 0) / 100) + Number(l.fine || 0);
    return Math.max(0, total - (paidMap[l.id] || 0));
  };
  const selected = loans.find((l) => l.id === loanId);
  const newPrincipal = selected ? Number(selected.principal) + remainingFor(selected) : 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const old = loans.find((l) => l.id === loanId);
    if (!old) return toast.error("Pick a loan");
    const due = new Date(); due.setMonth(due.getMonth() + months);
    const remaining = remainingFor(old);
    const principal = Number(old.principal) + remaining;
    const { error: e1 } = await supabase.from("loans").update({ status: "renewed" as const }).eq("id", old.id);
    if (e1) return toast.error(e1.message);
    const { error: e2 } = await supabase.from("loans").insert({
      client_id: old.client_id,
      principal,
      interest_rate: old.interest_rate,
      term_months: months,
      status: "active" as const,
      given_at: new Date().toISOString().slice(0, 10),
      due_at: due.toISOString().slice(0, 10),
      notes: `Renewed from loan ${old.id} — carried remaining ${remaining.toFixed(2)}`,
      created_by: user!.id,
    } as never);
    if (e2) return toast.error(e2.message);
    toast.success("Loan renewed");
    setLoanId(""); load();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <h1 className="font-display text-3xl font-bold">Renew Loan</h1>
        <p className="text-muted-foreground">Mark current loan as renewed and start a new term</p>
      </header>
      <Card className="shadow-soft">
        <CardHeader><CardTitle>Renewal</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>Active / Overdue Loan</Label>
              <Select value={loanId} onValueChange={setLoanId}>
                <SelectTrigger><SelectValue placeholder="Pick a loan" /></SelectTrigger>
                <SelectContent>{loans.map((l) => <SelectItem key={l.id} value={l.id}>{l.clients?.full_name} — principal {Number(l.principal).toLocaleString()}, remaining {remainingFor(l).toLocaleString()}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>New Term (months)</Label><Input type="number" min={1} value={months} onChange={(e) => setMonths(Number(e.target.value))} required /></div>
            {selected && (
              <div className="rounded-lg border bg-muted/40 p-3 text-sm space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">Recent loan principal</span><strong>{Number(selected.principal).toLocaleString()}</strong></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Unpaid balance</span><strong>{remainingFor(selected).toLocaleString()}</strong></div>
                <div className="flex justify-between border-t pt-1"><span>New combined principal</span><strong className="text-primary">{newPrincipal.toLocaleString()}</strong></div>
              </div>
            )}
            <Button type="submit">Renew</Button>
          </form>
        </CardContent>
      </Card>

      {loans.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-semibold">Active loans</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {loans.map((l) => {
              const paid = paidMap[l.id] || 0;
              const remaining = remainingFor(l);
              const pp = parsePerPeriod(l.notes);
              return (
                <div key={l.id} className="rounded-lg border bg-card p-3 text-sm shadow-soft">
                  <div className="font-medium">{l.clients?.full_name} — Active Loan</div>
                  <div className="mt-1 flex justify-between"><span className="text-muted-foreground">Remaining</span><strong>{remaining.toLocaleString()}</strong></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Paid</span><strong>{paid.toLocaleString()}</strong></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Daily payment</span><strong>{pp ? `${pp.amount.toLocaleString(undefined,{maximumFractionDigits:2})} / ${pp.schedule === "daily" ? "day" : "wk"}` : "—"}</strong></div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RenewLoan;