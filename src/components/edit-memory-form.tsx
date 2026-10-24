"use client";

import { useState, useTransition } from "react";
import { updateMemory } from "@/actions/memories";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";
import type { Destination, TravelMemory } from "@/types/database";

export function EditMemoryForm({ memory, destinations }: { memory: TravelMemory; destinations: Pick<Destination, "id" | "name" | "region">[] }) {
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="grid gap-6 rounded-[2rem] bg-white p-7 ring-1 ring-slate-200"
      action={(data) => startTransition(async () => {
        setError(undefined);
        const result = await updateMemory(memory.id, data);
        if (result?.error) setError(result.error);
      })}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div><Label htmlFor="title">Title</Label><Input id="title" name="title" defaultValue={memory.title} required minLength={3} maxLength={120} /></div>
        <div><Label htmlFor="destinationName">Destination</Label><Input id="destinationName" name="destinationName" defaultValue={memory.destination_name} required /></div>
        <div className="md:col-span-2"><Label htmlFor="destinationId">Linked catalogue destination (optional)</Label><select id="destinationId" name="destinationId" defaultValue={memory.destination_id ?? ""} className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[#123a50]"><option value="">No catalogue link</option>{destinations.map((destination) => <option key={destination.id} value={destination.id}>{destination.name}{destination.region ? ` · ${destination.region}` : ""}</option>)}</select></div>
        <div><Label htmlFor="locationVisited">Location</Label><Input id="locationVisited" name="locationVisited" defaultValue={memory.location_visited} required /></div>
        <div><Label htmlFor="country">Country</Label><Input id="country" name="country" defaultValue={memory.country} required /></div>
        <div><Label htmlFor="travelDate">Travel date</Label><Input id="travelDate" name="travelDate" type="date" defaultValue={memory.travel_date} required /></div>
        <div><Label htmlFor="category">Category</Label><Input id="category" name="category" defaultValue={memory.category ?? ""} /></div>
      </div>
      <div><Label htmlFor="description">Story</Label><Textarea id="description" name="description" defaultValue={memory.description} required minLength={40} maxLength={5000} /></div>
      <div><Label htmlFor="travelTips">Tips</Label><Textarea id="travelTips" name="travelTips" defaultValue={memory.travel_tips ?? ""} maxLength={2000} /></div>
      <div className="grid gap-5 md:grid-cols-3">
        <div><Label htmlFor="daysSpent">Days spent</Label><Input id="daysSpent" name="daysSpent" type="number" min={1} max={365} defaultValue={memory.days_spent ?? ""} /></div>
        <div><Label htmlFor="totalExpense">Total expense (₹)</Label><Input id="totalExpense" name="totalExpense" type="number" min={0} max={10000000} step="0.01" defaultValue={memory.total_expense ?? ""} /></div>
        <div><Label htmlFor="tripStyle">Travel style</Label><Input id="tripStyle" name="tripStyle" maxLength={80} defaultValue={memory.trip_style ?? ""} /></div>
      </div>
      <div><Label htmlFor="authorNote">About this journey</Label><Textarea id="authorNote" name="authorNote" maxLength={300} defaultValue={memory.author_note ?? ""} /></div>
      <div className="grid gap-5 md:grid-cols-4">
        <div><Label htmlFor="rating">Rating</Label><Input id="rating" name="rating" type="number" min={1} max={5} defaultValue={memory.rating} required /></div>
        <div><Label htmlFor="visibility">Visibility</Label><select id="visibility" name="visibility" defaultValue={memory.visibility} className="min-h-12 w-full rounded-2xl border border-slate-200 px-4"><option value="public">Public</option><option value="private">Private</option></select></div>
        <div><Label htmlFor="latitude">Latitude</Label><Input id="latitude" name="latitude" type="number" step="any" defaultValue={memory.latitude ?? ""} /></div>
        <div><Label htmlFor="longitude">Longitude</Label><Input id="longitude" name="longitude" type="number" step="any" defaultValue={memory.longitude ?? ""} /></div>
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save changes"}</Button>
    </form>
  );
}
