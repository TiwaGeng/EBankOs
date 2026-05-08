import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ReportToolbar, { periodRange, type Period } from "@/components/app/ReportToolbar";

interface Loan { id: string; principal: number; given_at: string; clients?: { full_name: string; phone: string | null } | null; }

const RenewedLoans = () => {
  const [rows, setRows] = useState<Loan[]>([]);
  const [period, setPeriod] = useState<Period>("monthly");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  useEffect(() => {
    const { from, to } = periodRange(period, date);
    supabase.from("loans").select("id, principal, given_at, clients(full_name, phone)").eq("status", "renewed").gte("given_at", from).lte("given_at", to).order("given_at", { ascending: false }).then(({ data }) => setRows((data ?? []) as Loan[]));
  }, [period, date]);
  const { from, to } = periodRange(period, date);
  const rangeLabel = from === to ? from : `${from} → ${to}`;
  const exportRows = useMemo(() => rows.map((l) => ({ Client: l.clients?.full_name ?? "—", Phone: l.clients?.phone ?? "", Principal: Number(l.principal), Given: l.given_at })), [rows]);
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold">Clients Renewed</h1>
        <p className="text-muted-foreground">{rangeLabel} · {rows.length} renewed loans</p>
      </header>
      <ReportToolbar period={period} onPeriodChange={setPeriod} date={date} onDateChange={setDate} rows={exportRows} filename={`renewed-loans-${rangeLabel}`} title={`Renewed Loans — ${rangeLabel}`} />
      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <Table>
            <TableHeader><TableRow><TableHead>Client</TableHead><TableHead>Phone</TableHead><TableHead>Principal</TableHead><TableHead>Given</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">No renewed loans</TableCell></TableRow>
                : rows.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.clients?.full_name ?? "—"}</TableCell>
                    <TableCell>{l.clients?.phone ?? "—"}</TableCell>
                    <TableCell>{Number(l.principal).toLocaleString()}</TableCell>
                    <TableCell>{l.given_at}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default RenewedLoans;