import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Landmark, LayoutDashboard, Users, HandCoins, Receipt, BarChart3, LogOut, ArrowLeftRight, UserCog, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuickActions from "@/components/app/QuickActions";

type NavChild = { to: string; label: string };
type NavItem =
  | { type: "link"; to: string; label: string; icon: typeof LayoutDashboard }
  | { type: "group"; key: string; label: string; icon: typeof LayoutDashboard; children: NavChild[] };

const baseNav: NavItem[] = [
  { type: "link", to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    type: "group", key: "clients", label: "Clients", icon: Users, children: [
      { to: "/clients/new", label: "Add a New Client" },
      { to: "/clients", label: "Client List" },
      { to: "/clients/manage", label: "Update / Delete" },
      { to: "/clients/book", label: "Client's Book" },
    ],
  },
  {
    type: "group", key: "loans", label: "Loan Actions", icon: HandCoins, children: [
      { to: "/loans/new", label: "Give Loan" },
      { to: "/loans", label: "All Loans" },
      { to: "/payments", label: "Loan Payment" },
      { to: "/loans/renew", label: "Renew Loan" },
      { to: "/loans/fine", label: "Add Fine" },
    ],
  },
  { type: "link", to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  {
    type: "group", key: "reports", label: "Reports", icon: BarChart3, children: [
      { to: "/reports", label: "Overview" },
      { to: "/reports/daily", label: "Daily Report" },
      { to: "/reports/not-paid", label: "Clients Not Paid" },
      { to: "/reports/with-loans", label: "Clients With Loans" },
      { to: "/reports/without-loans", label: "Clients Without Loans" },
      { to: "/reports/all-loans", label: "All Loans Given Out" },
      { to: "/reports/complicated", label: "Complicated Loans" },
      { to: "/reports/renewed", label: "Clients Renewed" },
    ],
  },
];

const AppLayout = () => {
  const { user, roles, signOut, loading, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const nav: NavItem[] = hasRole("admin")
    ? [...baseNav, { type: "link", to: "/employees", label: "Employees", icon: UserCog }]
    : baseNav;

  const initialOpen: Record<string, boolean> = {};
  nav.forEach((n) => {
    if (n.type === "group" && n.children.some((c) => location.pathname === c.to || location.pathname.startsWith(c.to + "/"))) {
      initialOpen[n.key] = true;
    }
  });
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(initialOpen);
  const toggle = (k: string) => setOpenGroups((o) => ({ ...o, [k]: !o[k] }));

  if (loading) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  if (!user) {
    navigate("/auth", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      <aside className="hidden md:flex w-64 flex-col bg-gradient-hero text-primary-foreground p-5">
        <div className="flex items-center gap-2 mb-8">
          <Landmark className="h-6 w-6 text-gold" />
          <span className="font-display text-xl font-bold">BankOS</span>
        </div>
        <nav className="space-y-1 flex-1 overflow-y-auto">
          {nav.map((item) => {
            if (item.type === "link") {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                      isActive ? "bg-gold text-gold-foreground font-semibold" : "text-primary-foreground/80 hover:bg-primary-foreground/10"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" /> {item.label}
                </NavLink>
              );
            }
            const Icon = item.icon;
            const isOpen = !!openGroups[item.key];
            return (
              <div key={item.key}>
                <button
                  type="button"
                  onClick={() => toggle(item.key)}
                  className="w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm text-primary-foreground/80 hover:bg-primary-foreground/10 transition"
                >
                  <span className="flex items-center gap-3"><Icon className="h-4 w-4" /> {item.label}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="ml-7 mt-1 space-y-0.5 border-l border-primary-foreground/10 pl-3">
                    {item.children.map((c) => (
                      <NavLink
                        key={c.to}
                        to={c.to}
                        end
                        className={({ isActive }) =>
                          `block rounded-md px-3 py-2 text-xs transition ${
                            isActive ? "bg-gold text-gold-foreground font-semibold" : "text-primary-foreground/70 hover:bg-primary-foreground/10"
                          }`
                        }
                      >
                        {c.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="border-t border-primary-foreground/10 pt-4 space-y-3">
          <div className="text-xs text-primary-foreground/60">
            <p className="truncate">{user.email}</p>
            <p className="text-gold capitalize">{roles[0]?.replace("_", " ") ?? "viewer"}</p>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-primary-foreground hover:bg-primary-foreground/10" onClick={async () => { await signOut(); navigate("/auth"); }}>
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="md:hidden flex items-center justify-between bg-primary text-primary-foreground p-4">
          <div className="flex items-center gap-2"><Landmark className="h-5 w-5 text-gold" /><span className="font-display font-bold">BankOS</span></div>
          <Button variant="ghost" size="sm" onClick={async () => { await signOut(); navigate("/auth"); }}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        <div className="md:hidden flex overflow-x-auto bg-card border-b">
          {nav.flatMap((item) => {
            if (item.type === "link") {
              const Icon = item.icon;
              return [(
                <NavLink key={item.to} to={item.to} end className={({ isActive }) => `flex flex-col items-center gap-1 px-4 py-2 text-xs whitespace-nowrap ${isActive ? "text-primary font-semibold border-b-2 border-gold" : "text-muted-foreground"}`}>
                  <Icon className="h-4 w-4" />{item.label}
                </NavLink>
              )];
            }
            return item.children.map((c) => (
              <NavLink key={c.to} to={c.to} end className={({ isActive }) => `flex items-center px-4 py-2 text-xs whitespace-nowrap ${isActive ? "text-primary font-semibold border-b-2 border-gold" : "text-muted-foreground"}`}>
                {c.label}
              </NavLink>
            ));
          })}
        </div>
        <QuickActions />
        <div className="p-6 lg:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;