import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, HandCoins, AlertTriangle, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const fmt = (n: number) => new Intl.NumberFormat().format(n);

const Dashboard = () => {
  const [stats, setStats] = useState({ clients: 0, activeLoans: 0, overdue: 0, collected: 0 });
  const [chart, setChart] = useState<{ day: string; amount: number }[]>([]);

  useEffect(() => {
    (async () => {
      const [{ count: clients }, loansRes, payRes] = await Promise.all([
        supabase.from("clients").select("*", { count: "exact", head: true }),
        supabase.from("loans").select("status, principal"),
        supabase.from("payments").select("amount, paid_at"),
      ]);
      const loans = loansRes.data ?? [];
      const pays = payRes.data ?? [];
      setStats({
        clients: clients ?? 0,
        activeLoans: loans.filter((l) => l.status === "active").length,
        overdue: loans.filter((l) => l.status === "overdue").length,
        collected: pays.reduce((a, p) => a + Number(p.amount), 0),
      });
      const map = new Map<string, number>();
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i));
        return d.toISOString().slice(0, 10);
      });
      days.forEach((d) => map.set(d, 0));
      pays.forEach((p) => { if (map.has(p.paid_at)) map.set(p.paid_at, (map.get(p.paid_at) ?? 0) + Number(p.amount)); });
      setChart(Array.from(map.entries()).map(([day, amount]) => ({ day: day.slice(5), amount })));
    })();
  }, []);

  const cards = [
    { label: "Total Clients", value: fmt(stats.clients), icon: Users },
    { label: "Active Loans", value: fmt(stats.activeLoans), icon: HandCoins },
    { label: "Overdue", value: fmt(stats.overdue), icon: AlertTriangle },
    { label: "Collected", value: fmt(stats.collected), icon: Wallet },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Snapshot of your business today</p>
      </header>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground font-medium">{label}</CardTitle>
              <Icon className="h-5 w-5 text-gold" />
            </CardHeader>
            <CardContent><p className="font-display text-3xl font-bold">{value}</p></CardContent>
          </Card>
        ))}
      </div>
      <Card className="shadow-soft">
        <CardHeader><CardTitle>Payments — last 7 days</CardTitle></CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="day" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;