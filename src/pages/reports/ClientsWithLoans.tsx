import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ExportBar from "@/components/app/ExportBar";

interface Row { id: string; full_name: string; phone: string | null; activeCount: number; totalPrincipal: number; }

const ClientsWithLoans = () => {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    (async () => {
      const { data: clients } = await supabase.from("clients").select("id, full_name, phone");
      const { data: loans } = await supabase.from("loans").select("client_id, principal, status").in("status", ["active", "overdue", "renewed"]);
      const map = new Map<string, { count: number; total: number }>();
      (loans ?? []).forEach((l) => {
        const cur = map.get(l.client_id) ?? { count: 0, total: 0 };
        cur.count += 1; cur.total += Number(l.principal);
        map.set(l.client_id, cur);
      });
      const out: Row[] = (clients ?? [])
        .filter((c) => map.has(c.id))
        .map((c) => ({ id: c.id, full_name: c.full_name, phone: c.phone, activeCount: map.get(c.id)!.count, totalPrincipal: map.get(c.id)!.total }));
      setRows(out);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold">Clients With Loans</h1>
        <p className="text-muted-foreground">{rows.length} clients have outstanding loans</p>
      </header>
      <ExportBar
        rows={rows.map((r) => ({ Client: r.full_name, Phone: r.phone ?? "", "Active Loans": r.activeCount, "Total Principal": r.totalPrincipal }))}
        filename="clients-with-loans"
        title="Clients With Loans"
      />
      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <Table>
            <TableHeader><TableRow><TableHead>Client</TableHead><TableHead>Phone</TableHead><TableHead>Active Loans</TableHead><TableHead>Total Principal</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">No clients with loans</TableCell></TableRow>
                : rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.full_name}</TableCell>
                    <TableCell>{r.phone ?? "—"}</TableCell>
                    <TableCell>{r.activeCount}</TableCell>
                    <TableCell>{r.totalPrincipal.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientsWithLoans;