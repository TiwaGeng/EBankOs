import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Loan { id: string; principal: number; status: string; given_at: string; due_at: string | null; clients?: { full_name: string } | null; }
interface Payment { id: string; amount: number; paid_at: string; loans?: { clients?: { full_name: string } | null } | null; }

const today = new Date().toISOString().slice(0, 10);

const Reports = () => {
  const [overdue, setOverdue] = useState<Loan[]>([]);
  const [todayPays, setTodayPays] = useState<Payment[]>([]);
  const [todayTotal, setTodayTotal] = useState(0);

  useEffect(() => {
    (async () => {
      const { data: ls } = await supabase.from("loans").select("*, clients(full_name)").or(`status.eq.overdue,and(status.eq.active,due_at.lt.${today})`);
      setOverdue((ls ?? []) as Loan[]);
      const { data: ps } = await supabase.from("payments").select("*, loans(clients(full_name))").eq("paid_at", today);
      const list = (ps ?? []) as Payment[];
      setTodayPays(list);
      setTodayTotal(list.reduce((a, p) => a + Number(p.amount), 0));
    })();
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Daily activity & overdue clients</p>
      </header>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Daily Report — {today}</CardTitle>
          <p className="text-sm text-muted-foreground">{todayPays.length} payments · {todayTotal.toLocaleString()} collected</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Client</TableHead><TableHead>Amount</TableHead></TableRow></TableHeader>
            <TableBody>
              {todayPays.length === 0 ? (
                <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground py-6">No payments today</TableCell></TableRow>
              ) : todayPays.map((p) => (
                <TableRow key={p.id}><TableCell>{p.loans?.clients?.full_name ?? "—"}</TableCell><TableCell>{Number(p.amount).toLocaleString()}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Overdue Loans</CardTitle>
          <p className="text-sm text-muted-foreground">{overdue.length} loans need attention</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Client</TableHead><TableHead>Principal</TableHead><TableHead>Given</TableHead><TableHead>Due</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {overdue.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No overdue loans 🎉</TableCell></TableRow>
              ) : overdue.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.clients?.full_name ?? "—"}</TableCell>
                  <TableCell>{Number(l.principal).toLocaleString()}</TableCell>
                  <TableCell>{l.given_at}</TableCell>
                  <TableCell>{l.due_at ?? "—"}</TableCell>
                  <TableCell><Badge variant="destructive">{l.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;