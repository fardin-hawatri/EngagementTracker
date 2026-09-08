import { igFetch } from "./client";

export interface InstagramMedia {
  id: string;
  caption?: string;
  media_type?: string;
  media_product_type?: string;
  permalink?: string;
  timestamp?: string;
  thumbnail_url?: string;
  media_url?: string;
  like_count?: number;
  comments_count?: number;
}

interface MediaPage {
  data?: InstagramMedia[];
  paging?: { next?: string };
}

export async function fetchAllMedia(onPage?: (count: number) => void): Promise<InstagramMedia[]> {
  const byId = new Map<string, InstagramMedia>();
  let nextUrl: string | null = null;
  let first = true;

  while (true) {
    const page: MediaPage = first
      ? await igFetch<MediaPage>("/me/media", {
          fields:
            "id,caption,media_type,media_product_type,permalink,timestamp,thumbnail_url,media_url,like_count,comments_count",
          limit: "100",
        })
      : await igFetch<MediaPage>(nextUrl!);
    first = false;
    for (const item of page.data ?? []) {
      if (item.id) byId.set(item.id, item);
    }
    onPage?.(byId.size);
    nextUrl = page.paging?.next ?? null;
    if (!nextUrl) break;
  }

  return [...byId.values()];
}

export function isReel(media: InstagramMedia): boolean {
  return media.media_product_type === "REELS" || (media.media_type === "VIDEO" && media.media_product_type !== "STORY");
}
