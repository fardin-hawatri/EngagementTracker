import { Router, type Request } from "express";
import { getDefaultProfileId, listPublicProfiles, resolveProfile } from "../config/profiles";
import { InstagramApiError } from "../instagram/client";
import { getProgress, getSnapshot, setProgress } from "../services/cacheService";
import { loadDataset } from "../services/reelService";

export const instagramRouter = Router();

function readProfileId(req: Request): string {
  const query = typeof req.query.profile === "string" ? req.query.profile : null;
  const header = req.header("x-profile-id");
  return (query || header || getDefaultProfileId()).trim();
}

instagramRouter.get("/profiles", (_req, res) => {
  const profiles = listPublicProfiles();
  res.json({
    profiles,
    defaultProfileId: getDefaultProfileId(),
  });
});

instagramRouter.get("/status", (req, res, next) => {
  try {
    const profileId = resolveProfile(readProfileId(req)).id;
    res.json(getProgress(profileId));
  } catch (error) {
    next(error);
  }
});

instagramRouter.get("/account", async (req, res, next) => {
  try {
    const profileId = readProfileId(req);
    const data = await loadDataset(profileId, false);
    res.json({
      profileId: data.profileId,
      platform: data.platform,
      account: data.account,
      fetchedAt: data.fetchedAt,
      mediaCount: data.mediaCount,
      reelCount: data.reelCount,
    });
  } catch (error) {
    next(error);
  }
});

instagramRouter.get("/reels", async (req, res, next) => {
  try {
    const data = await loadDataset(readProfileId(req), false);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

instagramRouter.post("/refresh", async (req, res, next) => {
  try {
    const data = await loadDataset(readProfileId(req), true);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

instagramRouter.get("/cache", (req, res, next) => {
  try {
    const profileId = resolveProfile(readProfileId(req)).id;
    const snapshot = getSnapshot(profileId);
    if (!snapshot) {
      res.status(404).json({ error: "Cache empty" });
      return;
    }
    res.json(snapshot);
  } catch (error) {
    next(error);
  }
});

export function handleInstagramError(
  error: unknown,
  req: Request,
  res: { status: (code: number) => { json: (body: unknown) => void } },
  next: (err: unknown) => void,
): void {
  if (error instanceof InstagramApiError) {
    try {
      const profileId = resolveProfile(readProfileId(req)).id;
      setProgress(profileId, { phase: "error", error: error.message, message: "Instagram sync failed." });
    } catch {
      /* ignore profile resolution failures while reporting */
    }
    res.status(error.status >= 400 ? error.status : 502).json({
      error: error.message,
      details: error.payload,
    });
    return;
  }
  next(error);
}
