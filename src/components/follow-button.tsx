"use client";

import { useState, useTransition } from "react";
import { UserPlus, UserRoundCheck } from "lucide-react";
import { toast } from "sonner";
import { setFollow } from "@/actions/social";
import { Button } from "@/components/ui/button";

export function FollowButton({ profileId, initialFollowing }: { profileId: string; initialFollowing: boolean }) {
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, startTransition] = useTransition();
  return <Button type="button" variant={following ? "outline" : "primary"} disabled={pending} aria-pressed={following} aria-label={following ? "Unfollow traveller" : "Follow traveller"} onClick={() => startTransition(async () => {
    const next = !following;
    const result = await setFollow(profileId, next);
    if (result.error) toast.error(result.error);
    else { setFollowing(next); toast.success(result.success); }
  })}>{following ? <UserRoundCheck size={17} /> : <UserPlus size={17} />}{pending ? "Updating…" : following ? "Following" : "Follow"}</Button>;
}
