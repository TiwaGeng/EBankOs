import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ExportBar from "@/components/app/ExportBar";

interface Client { id: string; full_name: string; phone: string | null; }

const ClientsWithoutLoans = () => {
  const [rows, setRows] = useState<Client[]>([]);

  useEffect(() => {
    (async () => {
      const { data: clients } = await supabase.from("clients").select("id, full_name, phone");
      const { data: loans } = await supabase.from("loans").select("client_id").in("status", ["active", "overdue", "renewed"]);
      const withLoans = new Set((loans ?? []).map((l) => l.client_id));
      setRows((clients ?? []).filter((c) => !withLoans.has(c.id)));
    })();
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold">Clients Without Loans</h1>
        <p className="text-muted-foreground">{rows.length} clients have no active loans</p>
      </header>
      <ExportBar
        rows={rows.map((c) => ({ Client: c.full_name, Phone: c.phone ?? "" }))}
        filename="clients-without-loans"
        title="Clients Without Loans"
      />
      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <Table>
            <TableHeader><TableRow><TableHead>Client</TableHead><TableHead>Phone</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.length === 0 ? <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground py-6">All clients have loans</TableCell></TableRow>
                : rows.map((c) => (<TableRow key={c.id}><TableCell className="font-medium">{c.full_name}</TableCell><TableCell>{c.phone ?? "—"}</TableCell></TableRow>))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientsWithoutLoans;