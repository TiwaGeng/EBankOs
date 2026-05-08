import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface Loan { id: string; principal: number; fine: number; clients?: { full_name: string } | null; }

const AddFine = () => {
  const { hasRole } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loanId, setLoanId] = useState("");
  const [amount, setAmount] = useState<number>(0);

  const load = async () => {
    const { data } = await supabase.from("loans").select("id, principal, fine, clients(full_name)").in("status", ["active", "overdue"]);
    setLoans((data ?? []) as Loan[]);
  };
  useEffect(() => { load(); }, []);

  if (!hasRole(["admin", "loan_officer"])) return <p className="text-muted-foreground">You don't have permission to add fines.</p>;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return toast.error("Pick a loan");
    if (amount <= 0) return toast.error("Enter an amount");
    const { error } = await supabase.from("loans").update({
      fine: Number(loan.fine || 0) + amount,
    }).eq("id", loan.id);
    if (error) return toast.error(error.message);
    toast.success("Fine added");
    setLoanId(""); setAmount(0); load();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <h1 className="font-display text-3xl font-bold">Add Fine</h1>
        <p className="text-muted-foreground">Apply a penalty to an outstanding loan</p>
      </header>
      <Card className="shadow-soft">
        <CardHeader><CardTitle>Fine details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>Loan</Label>
              <Select value={loanId} onValueChange={setLoanId}>
                <SelectTrigger><SelectValue placeholder="Pick a loan" /></SelectTrigger>
                <SelectContent>{loans.map((l) => <SelectItem key={l.id} value={l.id}>{l.clients?.full_name} — {Number(l.principal).toLocaleString()} (fine: {Number(l.fine || 0).toLocaleString()})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Fine amount</Label><Input type="number" step="0.01" value={amount || ""} onChange={(e) => setAmount(Number(e.target.value))} required /></div>
            <Button type="submit">Add Fine</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddFine;