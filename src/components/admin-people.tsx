"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { ShieldCheck, UserRound } from "lucide-react";
import { setUserAdmin } from "@/actions/admin";
import { Button } from "@/components/ui/button";

export type AdminUser = {
  id: string;
  email: string | null;
  display_name: string | null;
  username: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  is_admin: boolean;
  total_count: number;
};

function dateTime(value: string | null) {
  return value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Not signed in yet";
}

export function AdminPeople({ people, currentUserId }: { people: AdminUser[]; currentUserId: string }) {
  const [pending, startTransition] = useTransition();
  if (!people.length) return <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">No accounts match this search. New members will appear here after they sign up.</div>;
  return <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
    <table className="w-full min-w-[760px] text-left text-sm">
      <thead className="bg-[#f1f7f5] text-xs uppercase tracking-wider text-slate-600"><tr><th className="px-5 py-4">Member</th><th className="px-5 py-4">Joined</th><th className="px-5 py-4">Last signed in</th><th className="px-5 py-4">Access</th><th className="px-5 py-4 text-right">Action</th></tr></thead>
      <tbody className="divide-y divide-slate-100">{people.map((person) => <tr key={person.id}>
        <td className="px-5 py-5"><div className="flex items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#e7f3ee] text-[#0d6d67]"><UserRound size={19} /></span><div className="min-w-0"><p className="font-semibold text-[#123a50]">{person.display_name || person.username || "Traveler"}{person.id === currentUserId && <span className="ml-2 text-xs text-slate-500">(you)</span>}</p><p className="break-all text-xs text-slate-500">{person.email || "No email"}</p></div></div></td>
        <td className="px-5 py-5 text-slate-600">{dateTime(person.created_at)}</td>
        <td className="px-5 py-5 text-slate-600">{dateTime(person.last_sign_in_at)}</td>
        <td className="px-5 py-5"><span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${person.is_admin ? "bg-teal-100 text-teal-800" : "bg-slate-100 text-slate-700"}`}>{person.is_admin && <ShieldCheck size={14} />}{person.is_admin ? "Admin" : "Member"}</span></td>
        <td className="px-5 py-5 text-right">{person.id === currentUserId ? <span className="text-xs text-slate-500">Your access is protected</span> : <Button variant="outline" size="sm" disabled={pending} onClick={() => {
          const action = person.is_admin ? "remove administrator access from" : "give administrator access to";
          if (!window.confirm(`Are you sure you want to ${action} ${person.email || person.display_name || "this member"}?`)) return;
          startTransition(async () => {
            const result = await setUserAdmin(person.id, !person.is_admin);
            if (result.error) toast.error(result.error);
            else toast.success(person.is_admin ? "Administrator access removed" : "Administrator access granted");
          });
        }}>{person.is_admin ? "Remove admin" : "Make admin"}</Button>}</td>
      </tr>)}</tbody>
    </table>
  </div>;
}
