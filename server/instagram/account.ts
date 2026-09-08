import type { InstagramAccount } from "../../shared/types";
import { igFetch } from "./client";

interface MeResponse {
  id?: string;
  user_id?: string;
  username?: string;
  name?: string;
  account_type?: string;
  profile_picture_url?: string;
  followers_count?: number;
  media_count?: number;
}

export async function fetchAccount(): Promise<InstagramAccount> {
  const data = await igFetch<MeResponse>("/me", {
    fields: "id,user_id,username,name,account_type,profile_picture_url,followers_count,media_count",
  });
  return {
    id: data.user_id || data.id || "",
    username: data.username || "unknown",
    name: data.name ?? null,
    accountType: data.account_type ?? null,
    profilePictureUrl: data.profile_picture_url ?? null,
    followersCount: data.followers_count ?? null,
    mediaCount: data.media_count ?? null,
  };
}
