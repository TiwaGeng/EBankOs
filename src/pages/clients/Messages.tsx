import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Client { id: string; full_name: string; phone: string | null; }
interface Loan { id: string; client_id: string; principal: number; interest_rate: number; fine: number; status: string; notes: string | null; }

const parsePerPeriod = (notes: string | null) => {
  if (!notes) return null;
  const sch = /schedule:(daily|weekly)/.exec(notes)?.[1];
  const m = /per_(day|week):([0-9.]+)/.exec(notes);
  if (!sch || !m) return null;
  return { schedule: sch as "daily" | "weekly", amount: Number(m[2]) };
};

const Messages = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [paidMap, setPaidMap] = useState<Record<string, number>>({});
  const [clientId, setClientId] = useState("");
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");

  useEffect(() => {
    (async () => {
      const { data: cs } = await supabase.from("clients").select("id, full_name, phone").order("full_name");
      setClients((cs ?? []) as Client[]);
      const { data: ls } = await supabase.from("loans").select("id, client_id, principal, interest_rate, fine, status, notes").in("status", ["active", "overdue"]);
      const all = (ls ?? []) as Loan[];
      setLoans(all);
      const ids = all.map((l) => l.id);
      if (ids.length) {
        const { data: pays } = await supabase.from("payments").select("loan_id, amount").in("loan_id", ids);
        const m: Record<string, number> = {};
        (pays ?? []).forEach((p) => { m[p.loan_id] = (m[p.loan_id] || 0) + Number(p.amount); });
        setPaidMap(m);
      }
    })();
  }, []);

  const client = useMemo(() => clients.find((c) => c.id === clientId), [clients, clientId]);
  const clientLoans = useMemo(() => loans.filter((l) => l.client_id === clientId), [loans, clientId]);

  const summary = useMemo(() => {
    if (!client) return "";
    if (clientLoans.length === 0) return `Hello ${client.full_name}, you have no active loan with us. Thank you.`;
    const lines = clientLoans.map((l) => {
      const total = Number(l.principal) * (1 + Number(l.interest_rate || 0) / 100) + Number(l.fine || 0);
      const paid = paidMap[l.id] || 0;
      const remaining = Math.max(0, total - paid);
      const pp = parsePerPeriod(l.notes);
      const sched = pp ? `Please pay ${pp.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} per ${pp.schedule === "daily" ? "day" : "week"}.` : "";
      return `Loan ${l.principal.toLocaleString()} @ ${l.interest_rate}% — total ${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}, paid ${paid.toLocaleString()}, remaining ${remaining.toLocaleString(undefined, { maximumFractionDigits: 2 })}. ${sched}`;
    });
    return `Hello ${client.full_name},\n\n${lines.join("\n")}\n\nThank you.`;
  }, [client, clientLoans, paidMap]);

  useEffect(() => { setBody(summary); }, [summary]);

  const sendWhatsApp = () => {
    if (!client?.phone) return toast.error("Client has no phone number");
    const phone = client.phone.replace(/[^0-9]/g, "");
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(body)}`;
    window.open(url, "_blank");
  };

  const sendSMS = () => {
    if (!client?.phone) return toast.error("Client has no phone number");
    const url = `sms:${client.phone}?body=${encodeURIComponent(body)}`;
    window.location.href = url;
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <h1 className="font-display text-3xl font-bold flex items-center gap-2"><MessageCircle className="h-7 w-7" /> Client Messages</h1>
        <p className="text-muted-foreground">Send loan reminders and balance updates to your clients</p>
      </header>

      <Card className="shadow-soft">
        <CardHeader><CardTitle>Compose message</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Pick a client</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" role="combobox" className="w-full justify-between font-normal">
                  {client ? `${client.full_name}${client.phone ? ` — ${client.phone}` : ""}` : "Search client by name…"}
                  <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search…" />
                  <CommandList>
                    <CommandEmpty>No client found.</CommandEmpty>
                    <CommandGroup>
                      {clients.map((c) => (
                        <CommandItem key={c.id} value={c.full_name} onSelect={() => { setClientId(c.id); setOpen(false); }}>
                          <Check className={cn("mr-2 h-4 w-4", clientId === c.id ? "opacity-100" : "opacity-0")} />
                          <span className="flex-1 truncate">{c.full_name}</span>
                          {c.phone && <span className="ml-2 text-xs text-muted-foreground">{c.phone}</span>}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {client && (
            <>
              <div>
                <Label>Phone</Label>
                <Input value={client.phone ?? ""} readOnly />
              </div>
              <div>
                <Label>Message</Label>
                <Textarea rows={8} value={body} onChange={(e) => setBody(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button type="button" onClick={sendWhatsApp} disabled={!client.phone}>Send via WhatsApp</Button>
                <Button type="button" variant="outline" onClick={sendSMS} disabled={!client.phone}>Send via SMS</Button>
              </div>
              {!client.phone && <p className="text-xs text-destructive">This client has no phone number on file.</p>}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Messages;
