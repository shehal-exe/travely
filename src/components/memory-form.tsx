"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Camera, ImagePlus, Lock, Star, X } from "lucide-react";
import { createMemory, type ActionState } from "@/actions/memories";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";
import { imageRules, validateImages } from "@/lib/validations/memory";
import type { Destination } from "@/types/database";

const initialState: ActionState = {};

export function MemoryForm({ destinations, selectedDestinationId }: { destinations: Pick<Destination, "id" | "name" | "region">[]; selectedDestinationId?: string }) {
  const [state, action, pending] = useActionState(createMemory, initialState);
  const selectedDestination = destinations.find((item) => item.id === selectedDestinationId);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const previews = useMemo(() => files.map((file) => ({ file, url: URL.createObjectURL(file) })), [files]);
  useEffect(() => () => previews.forEach(({ url }) => URL.revokeObjectURL(url)), [previews]);
  function syncFiles(next: File[]) {
    const selection = new DataTransfer();
    next.forEach((file) => selection.items.add(file));
    if (fileInput.current) fileInput.current.files = selection.files;
    setFiles(next);
    setError(validateImages(next));
  }
  function onFiles(list: FileList | null) {
    const next = Array.from(list ?? []);
    const message = validateImages(next);
    setError(message);
    if (!message) syncFiles(next);
  }
  return (
    <form action={action} className="grid gap-8 rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-900/5 ring-1 ring-slate-200 md:p-10">
      <div className="grid gap-6 md:grid-cols-2">
        <div><Label htmlFor="title">Travel title</Label><Input id="title" name="title" required minLength={3} placeholder="A sunrise I will never forget" /></div>
        <div><Label htmlFor="destinationName">Destination</Label><Input id="destinationName" name="destinationName" required defaultValue={selectedDestination?.name} placeholder="Munnar" /></div>
        <div className="md:col-span-2"><Label htmlFor="destinationId">Link to a known destination (optional)</Label><select id="destinationId" name="destinationId" defaultValue={selectedDestinationId ?? ""} className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[#123a50]"><option value="">No catalogue link</option>{destinations.map((destination) => <option key={destination.id} value={destination.id}>{destination.name}{destination.region ? ` · ${destination.region}` : ""}</option>)}</select><p className="mt-2 text-xs text-slate-500">Choose a catalogue place to feature this story on its destination page. Your destination text stays editable.</p></div>
        <div><Label htmlFor="locationVisited">Specific location</Label><Input id="locationVisited" name="locationVisited" required placeholder="Tea Museum Road" /></div>
        <div><Label htmlFor="country">Country</Label><Input id="country" name="country" required defaultValue={selectedDestination ? "India" : undefined} placeholder="India" /></div>
        <div><Label htmlFor="travelDate">Travel date</Label><Input id="travelDate" name="travelDate" type="date" required /></div>
        <div><Label htmlFor="category">Category</Label><Input id="category" name="category" placeholder="Nature, beach, city…" /></div>
      </div>
      <div><Label htmlFor="description">Your story</Label><Textarea id="description" name="description" required minLength={40} placeholder="What made this journey meaningful? Include the moments, people, and details you want to remember." /></div>
      <div><Label htmlFor="travelTips">Travel tips</Label><Textarea id="travelTips" name="travelTips" className="min-h-28" placeholder="What should another traveler know before visiting?" /></div>
      <div className="grid gap-6 md:grid-cols-3">
        <div><Label htmlFor="daysSpent">Days spent</Label><Input id="daysSpent" name="daysSpent" type="number" min={1} max={365} placeholder="3" /></div>
        <div><Label htmlFor="totalExpense">Total expense (₹)</Label><Input id="totalExpense" name="totalExpense" type="number" min={0} max={10000000} step="0.01" placeholder="18000" /></div>
        <div><Label htmlFor="tripStyle">Travel style</Label><Input id="tripStyle" name="tripStyle" maxLength={80} placeholder="Solo · Budget" /></div>
      </div>
      <div><Label htmlFor="authorNote">About this journey (optional)</Label><Textarea id="authorNote" name="authorNote" maxLength={300} className="min-h-24" placeholder="A short introduction to your experience and what readers can expect." /></div>
      <div className="grid gap-6 md:grid-cols-3">
        <div><Label htmlFor="rating">Rating</Label><div className="relative"><Star className="absolute left-4 top-3.5 text-amber-500" size={20} /><Input id="rating" name="rating" type="number" min={1} max={5} required className="pl-12" placeholder="5" /></div></div>
        <div><Label htmlFor="visibility">Visibility</Label><div className="relative"><Lock className="absolute left-4 top-3.5 text-slate-400" size={20} /><select id="visibility" name="visibility" className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4" defaultValue="public"><option value="public">Public</option><option value="private">Private</option></select></div></div>
        <div><Label htmlFor="coordinates">Coordinates (optional)</Label><div className="grid grid-cols-2 gap-2"><Input name="latitude" type="number" step="any" placeholder="Latitude" /><Input name="longitude" type="number" step="any" placeholder="Longitude" /></div></div>
      </div>
      <div>
        <Label htmlFor="images">Travel photographs</Label>
        <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-teal-200 bg-teal-50/50 text-center transition hover:border-[#0d6d67]">
          <ImagePlus className="mb-2 text-[#0d6d67]" /><span className="font-semibold text-slate-800">Choose up to {imageRules.maxFiles} images</span><span className="mt-1 text-sm text-slate-500">JPG, PNG, WebP or AVIF · max 8 MB each</span>
          <input ref={fileInput} id="images" name="images" type="file" accept={imageRules.accepted.join(",")} multiple required className="sr-only" onChange={(event) => onFiles(event.target.files)} />
        </label>
        {previews.length > 0 && <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{previews.map(({ file, url }, index) => <div key={`${file.name}-${index}`} className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100"><Image src={url} alt="Upload preview" fill unoptimized className="object-cover" /><button type="button" aria-label="Remove image" onClick={() => syncFiles(files.filter((_, itemIndex) => itemIndex !== index))} className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-black/60 text-white"><X size={15} /></button></div>)}</div>}
      </div>
      {(error || state.error) && <p className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700">{error || state.error}</p>}
      <Button type="submit" size="lg" disabled={pending || Boolean(error)}><Camera size={18} />{pending ? "Saving your journey…" : "Publish travel memory"}</Button>
    </form>
  );
}
