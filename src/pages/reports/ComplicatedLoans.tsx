import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ExportBar from "@/components/app/ExportBar";

interface Loan { id: string; principal: number; fine: number; status: string; given_at: string; due_at: string | null; clients?: { full_name: string; phone: string | null } | null; }

const today = new Date().toISOString().slice(0, 10);

const ComplicatedLoans = () => {
  const [rows, setRows] = useState<Loan[]>([]);
  useEffect(() => {
    supabase.from("loans").select("*, clients(full_name, phone)").or(`status.eq.overdue,fine.gt.0,and(status.eq.active,due_at.lt.${today})`).then(({ data }) => setRows((data ?? []) as Loan[]));
  }, []);
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold">Complicated Loans</h1>
        <p className="text-muted-foreground">{rows.length} loans need attention (overdue or with fines)</p>
      </header>
      <ExportBar
        rows={rows.map((l) => ({ Client: l.clients?.full_name ?? "—", Phone: l.clients?.phone ?? "", Principal: Number(l.principal), Fine: Number(l.fine || 0), Due: l.due_at ?? "", Status: l.status }))}
        filename="complicated-loans"
        title="Complicated Loans"
      />
      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <Table>
            <TableHeader><TableRow><TableHead>Client</TableHead><TableHead>Phone</TableHead><TableHead>Principal</TableHead><TableHead>Fine</TableHead><TableHead>Due</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No complicated loans 🎉</TableCell></TableRow>
                : rows.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.clients?.full_name ?? "—"}</TableCell>
                    <TableCell>{l.clients?.phone ?? "—"}</TableCell>
                    <TableCell>{Number(l.principal).toLocaleString()}</TableCell>
                    <TableCell>{Number(l.fine || 0).toLocaleString()}</TableCell>
                    <TableCell>{l.due_at ?? "—"}</TableCell>
                    <TableCell><Badge variant="destructive" className="capitalize">{l.status}</Badge></TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplicatedLoans;