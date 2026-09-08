import { Router } from "express";
import { InstagramApiError } from "../instagram/client";
import { getProgress, getSnapshot } from "../services/cacheService";
import { loadDataset } from "../services/reelService";

export const instagramRouter = Router();

instagramRouter.get("/status", (_req, res) => {
  res.json(getProgress());
});

instagramRouter.get("/account", async (_req, res, next) => {
  try {
    const data = await loadDataset(false);
    res.json({
      account: data.account,
      fetchedAt: data.fetchedAt,
      mediaCount: data.mediaCount,
      reelCount: data.reelCount,
    });
  } catch (error) {
    next(error);
  }
});

instagramRouter.get("/reels", async (_req, res, next) => {
  try {
    const data = await loadDataset(false);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

instagramRouter.post("/refresh", async (_req, res, next) => {
  try {
    const data = await loadDataset(true);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

instagramRouter.get("/cache", (_req, res) => {
  const snapshot = getSnapshot();
  if (!snapshot) {
    res.status(404).json({ error: "Cache empty" });
    return;
  }
  res.json(snapshot);
});

export function handleInstagramError(error: unknown, _req: unknown, res: { status: (code: number) => { json: (body: unknown) => void } }, next: (err: unknown) => void): void {
  if (error instanceof InstagramApiError) {
    res.status(error.status >= 400 ? error.status : 502).json({
      error: error.message,
      details: error.payload,
    });
    return;
  }
  next(error);
}
