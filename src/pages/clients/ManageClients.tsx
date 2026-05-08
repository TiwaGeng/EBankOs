import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Client { id: string; full_name: string; last_name: string | null; phone: string | null; national_id: string | null; address: string | null; }

const ManageClients = () => {
  const { hasRole } = useAuth();
  const canEdit = hasRole(["admin", "loan_officer"]);
  const canDelete = hasRole("admin");
  const [items, setItems] = useState<Client[]>([]);
  const [editing, setEditing] = useState<Client | null>(null);
  const [search, setSearch] = useState("");

  const load = async () => {
    const { data, error } = await supabase.from("clients").select("id, full_name, last_name, phone, national_id, address").order("full_name");
    if (error) toast.error(error.message);
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing) return;
    const fd = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const { error } = await supabase.from("clients").update({
      full_name: fd.full_name, last_name: fd.last_name || null, phone: fd.phone || null,
      national_id: fd.national_id || null, address: fd.address || null,
    }).eq("id", editing.id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Permanently delete this client?")) return;
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  const filtered = items.filter((c) => c.full_name.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Update / Delete Clients</h1>
          <p className="text-muted-foreground">{items.length} clients</p>
        </div>
        <Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-56" />
      </header>
      <div className="bg-card border rounded-xl shadow-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow><TableHead>First name</TableHead><TableHead>Last name</TableHead><TableHead>Phone</TableHead><TableHead>National ID</TableHead><TableHead>Address</TableHead><TableHead className="w-24"></TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">No clients</TableCell></TableRow>
            ) : filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.full_name}</TableCell>
                <TableCell>{c.last_name || "—"}</TableCell>
                <TableCell>{c.phone || "—"}</TableCell>
                <TableCell>{c.national_id || "—"}</TableCell>
                <TableCell>{c.address || "—"}</TableCell>
                <TableCell className="flex gap-1">
                  {canEdit && <Button variant="ghost" size="icon" onClick={() => setEditing(c)}><Pencil className="h-4 w-4" /></Button>}
                  {canDelete && <Button variant="ghost" size="icon" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Client</DialogTitle></DialogHeader>
          {editing && (
            <form onSubmit={save} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>First name</Label><Input name="full_name" defaultValue={editing.full_name} required /></div>
                <div><Label>Last name</Label><Input name="last_name" defaultValue={editing.last_name ?? ""} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Phone</Label><Input name="phone" defaultValue={editing.phone ?? ""} /></div>
                <div><Label>National ID</Label><Input name="national_id" defaultValue={editing.national_id ?? ""} /></div>
              </div>
              <div><Label>Address</Label><Input name="address" defaultValue={editing.address ?? ""} /></div>
              <Button type="submit" className="w-full">Save changes</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageClients;