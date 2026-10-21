"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileActionState } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";
import type { Profile } from "@/types/database";

export function ProfileForm({ profile }: { profile: Profile }) {
  const initialState: ProfileActionState = {};
  const [state, action, pending] = useActionState(updateProfile, initialState);
  return <form action={action} className="grid gap-5 rounded-[2rem] bg-white p-7 shadow-sm ring-1 ring-slate-200"><div><Label htmlFor="username">Username</Label><Input id="username" name="username" defaultValue={profile.username} required minLength={3} maxLength={30} /></div><div><Label htmlFor="displayName">Display name</Label><Input id="displayName" name="displayName" defaultValue={profile.display_name} required minLength={2} maxLength={80} /></div><div><Label htmlFor="location">Location</Label><Input id="location" name="location" defaultValue={profile.location ?? ""} maxLength={120} /></div><div><Label htmlFor="bio">Biography</Label><Textarea id="bio" name="bio" defaultValue={profile.bio ?? ""} maxLength={500} className="min-h-28" /></div>{state.error && <p className="text-sm text-red-700">{state.error}</p>}{state.success && <p className="text-sm text-emerald-700">{state.success}</p>}<Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save profile"}</Button></form>;
}
