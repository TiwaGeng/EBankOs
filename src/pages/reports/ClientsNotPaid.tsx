import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ExportBar from "@/components/app/ExportBar";

interface Loan { id: string; principal: number; due_at: string | null; given_at: string; notes: string | null; clients?: { full_name: string; phone: string | null } | null; }

const parsePerDay = (notes: string | null): number => {
  if (!notes) return 0;
  const m = /per_day:([0-9.]+)/.exec(notes);
  return m ? Number(m[1]) : 0;
};

const today = new Date().toISOString().slice(0, 10);

const ClientsNotPaid = () => {
  const [rows, setRows] = useState<Loan[]>([]);

  useEffect(() => {
    (async () => {
      const { data: loans } = await supabase.from("loans").select("id, principal, due_at, given_at, notes, clients(full_name, phone)").in("status", ["active", "overdue"]);
      const ids = (loans ?? []).map((l) => l.id);
      if (ids.length === 0) { setRows([]); return; }
      const { data: pays } = await supabase.from("payments").select("loan_id").eq("paid_at", today).in("loan_id", ids);
      const paid = new Set((pays ?? []).map((p) => p.loan_id));
      setRows(((loans ?? []) as Loan[]).filter((l) => !paid.has(l.id)));
    })();
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold">Clients Not Paid Today</h1>
        <p className="text-muted-foreground">{rows.length} clients owe a payment for {today}</p>
      </header>
      <ExportBar
        rows={rows.map((l) => ({ Client: l.clients?.full_name ?? "—", Phone: l.clients?.phone ?? "", Principal: Number(l.principal), "Daily payment": parsePerDay(l.notes), Due: l.due_at ?? "" }))}
        filename={`clients-not-paid-${today}`}
        title={`Clients Not Paid — ${today}`}
      />
      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <Table>
            <TableHeader><TableRow><TableHead>Client</TableHead><TableHead>Phone</TableHead><TableHead>Principal</TableHead><TableHead>Daily payment</TableHead><TableHead>Due</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">Everyone paid today 🎉</TableCell></TableRow>
                : rows.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.clients?.full_name ?? "—"}</TableCell>
                    <TableCell>{l.clients?.phone ?? "—"}</TableCell>
                    <TableCell>{Number(l.principal).toLocaleString()}</TableCell>
                    <TableCell>{parsePerDay(l.notes).toLocaleString(undefined,{maximumFractionDigits:2})}</TableCell>
                    <TableCell>{l.due_at ?? "—"}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientsNotPaid;