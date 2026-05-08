import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ReportToolbar, { periodRange, type Period } from "@/components/app/ReportToolbar";

interface Payment { id: string; amount: number; method: string; paid_at: string; loans?: { clients?: { full_name: string } | null } | null; }

const DailyReport = () => {
  const [period, setPeriod] = useState<Period>("daily");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [pays, setPays] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    (async () => {
      const { from, to } = periodRange(period, date);
      const { data } = await supabase.from("payments").select("*, loans(clients(full_name))").gte("paid_at", from).lte("paid_at", to).order("paid_at", { ascending: false });
      const list = (data ?? []) as Payment[];
      setPays(list);
      setTotal(list.reduce((a, p) => a + Number(p.amount), 0));
    })();
  }, [date, period]);

  const { from, to } = periodRange(period, date);
  const rangeLabel = from === to ? from : `${from} → ${to}`;
  const exportRows = pays.map((p) => ({
    Date: p.paid_at,
    Client: p.loans?.clients?.full_name ?? "—",
    Amount: Number(p.amount),
    Method: p.method.replace("_", " "),
  }));

  return (
    <div className="space-y-6">
      <header>
        <div>
          <h1 className="font-display text-3xl font-bold capitalize">{period} Report</h1>
          <p className="text-muted-foreground">{pays.length} payments · {total.toLocaleString()} collected</p>
        </div>
      </header>
      <ReportToolbar period={period} onPeriodChange={setPeriod} date={date} onDateChange={setDate} rows={exportRows} filename={`${period}-report-${rangeLabel}`} title={`${period[0].toUpperCase()}${period.slice(1)} Report — ${rangeLabel}`} />
      <Card className="shadow-soft">
        <CardHeader><CardTitle>Payments — {rangeLabel}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Client</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead></TableRow></TableHeader>
            <TableBody>
              {pays.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">No payments</TableCell></TableRow>
                : pays.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.paid_at}</TableCell>
                    <TableCell>{p.loans?.clients?.full_name ?? "—"}</TableCell>
                    <TableCell>{Number(p.amount).toLocaleString()}</TableCell>
                    <TableCell className="capitalize">{p.method.replace("_", " ")}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyReport;