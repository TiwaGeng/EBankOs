import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Client { id: string; full_name: string; last_name: string | null; phone: string | null; }
interface Loan { id: string; principal: number; interest_rate: number; term_months: number; status: string; given_at: string; due_at: string | null; }
interface Payment { id: string; amount: number; method: string; paid_at: string; }

const ClientBook = () => {
  const [params] = useSearchParams();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>(params.get("id") ?? "");
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    supabase.from("clients").select("id, full_name, last_name, phone").order("full_name").then(({ data }) => setClients((data ?? []) as Client[]));
  }, []);

  useEffect(() => {
    if (!selectedId) { setLoans([]); setPayments([]); return; }
    (async () => {
      const { data: ls } = await supabase.from("loans").select("*").eq("client_id", selectedId).order("given_at", { ascending: false });
      setLoans((ls ?? []) as Loan[]);
      const ids = (ls ?? []).map((l) => l.id);
      if (ids.length === 0) { setPayments([]); return; }
      const { data: ps } = await supabase.from("payments").select("*").in("loan_id", ids).order("paid_at", { ascending: false });
      setPayments((ps ?? []) as Payment[]);
    })();
  }, [selectedId]);

  const filtered = clients.filter((c) => c.full_name.toLowerCase().includes(search.toLowerCase()));
  const selected = clients.find((c) => c.id === selectedId);
  const totalPaid = payments.reduce((a, p) => a + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold">Client's Book</h1>
        <p className="text-muted-foreground">Full loan & payment history per client</p>
      </header>
      <div className="grid md:grid-cols-3 gap-4">
        <Input placeholder="Search clients…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className="md:col-span-2"><SelectValue placeholder="Select a client" /></SelectTrigger>
          <SelectContent>
            {filtered.map((c) => <SelectItem key={c.id} value={c.id}>{c.full_name}{c.last_name ? ` ${c.last_name}` : ""}{c.phone ? ` — ${c.phone}` : ""}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {selected && (
        <>
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>{selected.full_name}{selected.last_name ? ` ${selected.last_name}` : ""}</CardTitle>
              <p className="text-sm text-muted-foreground">{loans.length} loans · {payments.length} payments · {totalPaid.toLocaleString()} paid</p>
            </CardHeader>
          </Card>
          <Card className="shadow-soft">
            <CardHeader><CardTitle>Loans</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Given</TableHead><TableHead>Principal</TableHead><TableHead>Rate</TableHead><TableHead>Due</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {loans.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No loans</TableCell></TableRow>
                    : loans.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell>{l.given_at}</TableCell>
                        <TableCell>{Number(l.principal).toLocaleString()}</TableCell>
                        <TableCell>{l.interest_rate}%</TableCell>
                        <TableCell>{l.due_at ?? "—"}</TableCell>
                        <TableCell className="capitalize">{l.status}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardHeader><CardTitle>Payments</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead></TableRow></TableHeader>
                <TableBody>
                  {payments.length === 0 ? <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-6">No payments</TableCell></TableRow>
                    : payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.paid_at}</TableCell>
                        <TableCell>{Number(p.amount).toLocaleString()}</TableCell>
                        <TableCell className="capitalize">{p.method.replace("_", " ")}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ClientBook;