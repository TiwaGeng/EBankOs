import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

const Settings = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ full_name: string; phone: string; avatar_url: string | null }>({ full_name: "", phone: "", avatar_url: null });
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name, phone, avatar_url").eq("id", user.id).single().then(({ data }) => {
      if (data) setProfile({ full_name: data.full_name ?? "", phone: data.phone ?? "", avatar_url: data.avatar_url ?? null });
    });
  }, [user]);

  if (!user) return null;

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("profiles").update({ full_name: profile.full_name, phone: profile.phone }).eq("id", user.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
  };

  const uploadAvatar = async (file: File) => {
    if (file.size > 2 * 1024 * 1024) return toast.error("Max 2MB");
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    setBusy(true);
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (upErr) { setBusy(false); return toast.error(upErr.message); }
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    const { error } = await supabase.from("profiles").update({ avatar_url: pub.publicUrl }).eq("id", user.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    setProfile((p) => ({ ...p, avatar_url: pub.publicUrl }));
    toast.success("Profile picture updated");
  };

  const changePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const current = String(fd.get("current"));
    const next = String(fd.get("next"));
    const confirm = String(fd.get("confirm"));
    if (next.length < 6) return toast.error("New password must be at least 6 characters");
    if (next !== confirm) return toast.error("New passwords don't match");
    setBusy(true);
    // Re-verify with current password
    const { error: reErr } = await supabase.auth.signInWithPassword({ email: user.email!, password: current });
    if (reErr) { setBusy(false); return toast.error("Current password is incorrect"); }
    // Send confirmation email
    await supabase.auth.resetPasswordForEmail(user.email!, { redirectTo: `${window.location.origin}/settings` });
    // Apply the new password
    const { error } = await supabase.auth.updateUser({ password: next });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password changed. A confirmation email has been sent to your inbox.");
    (e.target as HTMLFormElement).reset();
  };

  const initials = (profile.full_name || user.email || "U").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <h1 className="font-display text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and password</p>
      </header>

      <Card className="shadow-soft">
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              {profile.avatar_url && <AvatarImage src={profile.avatar_url} alt="Avatar" />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={busy}>Change picture</Button>
              <p className="text-xs text-muted-foreground mt-1">PNG/JPG, up to 2 MB</p>
            </div>
          </div>
          <form onSubmit={saveProfile} className="space-y-3">
            <div><Label>Full name</Label><Input value={profile.full_name} onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))} /></div>
            <div><Label>Phone</Label><Input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} /></div>
            <div><Label>Email</Label><Input value={user.email ?? ""} disabled /></div>
            <Button type="submit" disabled={busy}>Save profile</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader><CardTitle>Change password</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={changePassword} className="space-y-3">
            <div><Label>Current password</Label><Input name="current" type="password" required /></div>
            <div><Label>New password</Label><Input name="next" type="password" required minLength={6} /></div>
            <div><Label>Confirm new password</Label><Input name="confirm" type="password" required minLength={6} /></div>
            <p className="text-xs text-muted-foreground">A confirmation email will be sent to {user.email}.</p>
            <Button type="submit" disabled={busy}>Update password</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
