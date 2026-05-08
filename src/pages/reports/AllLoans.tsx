import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ReportToolbar, { periodRange, type Period } from "@/components/app/ReportToolbar";

interface Loan { id: string; principal: number; status: string; given_at: string; due_at: string | null; clients?: { full_name: string } | null; }

const AllLoans = () => {
  const [rows, setRows] = useState<Loan[]>([]);
  const [period, setPeriod] = useState<Period>("monthly");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  useEffect(() => {
    const { from, to } = periodRange(period, date);
    supabase.from("loans").select("*, clients(full_name)").gte("given_at", from).lte("given_at", to).order("given_at", { ascending: false }).then(({ data }) => setRows((data ?? []) as Loan[]));
  }, [period, date]);
  const total = rows.reduce((a, l) => a + Number(l.principal), 0);
  const { from, to } = periodRange(period, date);
  const rangeLabel = from === to ? from : `${from} → ${to}`;
  const exportRows = useMemo(() => rows.map((l) => ({
    Client: l.clients?.full_name ?? "—",
    Principal: Number(l.principal),
    Given: l.given_at,
    Due: l.due_at ?? "",
    Status: l.status,
  })), [rows]);
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold">All Loans Given Out</h1>
        <p className="text-muted-foreground">{rangeLabel} · {rows.length} loans · {total.toLocaleString()} principal</p>
      </header>
      <ReportToolbar period={period} onPeriodChange={setPeriod} date={date} onDateChange={setDate} rows={exportRows} filename={`all-loans-${rangeLabel}`} title={`All Loans — ${rangeLabel}`} />
      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <Table>
            <TableHeader><TableRow><TableHead>Client</TableHead><TableHead>Principal</TableHead><TableHead>Given</TableHead><TableHead>Due</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No loans</TableCell></TableRow>
                : rows.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.clients?.full_name ?? "—"}</TableCell>
                    <TableCell>{Number(l.principal).toLocaleString()}</TableCell>
                    <TableCell>{l.given_at}</TableCell>
                    <TableCell>{l.due_at ?? "—"}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{l.status}</Badge></TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AllLoans;