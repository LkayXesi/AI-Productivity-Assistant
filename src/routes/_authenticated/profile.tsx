import { createFileRoute } from "@tanstack/react-router";
import { Suspense, useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { getProfile, updateProfile } from "@/lib/profile.functions";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — Space Hub" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <AppShell title="Profile" subtitle="Manage your account details." crumbs={[{ to: "/dashboard", label: "Dashboard" }, { label: "Profile" }]}>
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <ProfileContent />
      </Suspense>
    </AppShell>
  );
}

function initials(name?: string | null, email?: string | null) {
  const src = (name?.trim() || email || "?").trim();
  const parts = src.split(/\s+|@/).filter(Boolean);
  return (parts[0]?.[0] ?? "?").toUpperCase() + (parts[1]?.[0]?.toUpperCase() ?? "");
}

function ProfileContent() {
  const getFn = useServerFn(getProfile);
  const updateFn = useServerFn(updateProfile);
  const qc = useQueryClient();
  const { data: profile } = useSuspenseQuery({ queryKey: ["profile"], queryFn: () => getFn() });

  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
    setAvatarUrl(profile?.avatar_url ?? "");
  }, [profile]);

  async function save() {
    setSaving(true);
    try {
      await updateFn({
        data: {
          full_name: fullName.trim() || null,
          avatar_url: avatarUrl.trim() || null,
        },
      });
      toast.success("Profile updated");
      await qc.invalidateQueries({ queryKey: ["profile"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="grid md:grid-cols-[280px_1fr] gap-6">
      <Card className="p-6 flex flex-col items-center text-center">
        <Avatar className="h-24 w-24">
          <AvatarImage src={avatarUrl || undefined} alt={fullName || profile?.email || "Avatar"} />
          <AvatarFallback className="text-xl gradient-brand text-white">
            {initials(fullName, profile?.email)}
          </AvatarFallback>
        </Avatar>
        <div className="mt-4 font-semibold">{fullName || profile?.email?.split("@")[0]}</div>
        <div className="text-xs text-muted-foreground break-all">{profile?.email}</div>
        {profile?.created_at && (
          <div className="mt-3 text-xs text-muted-foreground">
            Member since {new Date(profile.created_at).toLocaleDateString()}
          </div>
        )}
        <Separator className="my-4" />
        <Button variant="outline" className="w-full" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" /> Sign out
        </Button>
      </Card>

      <Card className="p-6 space-y-5">
        <h2 className="text-lg font-semibold">Account information</h2>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={profile?.email ?? ""} disabled />
          <p className="mt-1 text-xs text-muted-foreground">Email is managed by your sign-in provider.</p>
        </div>
        <div>
          <Label htmlFor="full_name">Full name</Label>
          <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={120} placeholder="Your full name" />
        </div>
        <div>
          <Label htmlFor="avatar">Avatar URL</Label>
          <Input id="avatar" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} maxLength={2000} placeholder="https://…" />
        </div>
        <div className="flex justify-end">
          <Button onClick={save} disabled={saving} className="bg-brand text-brand-foreground hover:bg-brand/90">
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : "Save changes"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
