import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getConfiguredProfiles, getDefaultProfileId } from "./config/profiles";
import { handleInstagramError, instagramRouter } from "./routes/instagram";
import { setProgress } from "./services/cacheService";
import { loadDataset } from "./services/reelService";

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", ".env") });

const app = express();
const PORT = Number(process.env.PORT || 8787);

const defaultOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];
const envOrigins = (process.env.CORS_ORIGINS || process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
  }),
);
app.use(express.json({ limit: "2mb" }));

app.get("/", (_req, res) => {
  const profiles = getConfiguredProfiles().map((profile) => ({
    id: profile.id,
    label: profile.label,
    platform: profile.platform,
  }));
  res.json({
    ok: true,
    service: "content-intel-api",
    message: "This is the API only. Open the Vercel frontend URL in the browser.",
    health: "/api/health",
    profilesPath: "/api/instagram/profiles",
    profiles,
  });
});

app.get("/api/health", (_req, res) => {
  const profiles = getConfiguredProfiles().map((profile) => ({
    id: profile.id,
    label: profile.label,
    platform: profile.platform,
  }));
  res.json({ ok: true, service: "content-intel", profiles, time: new Date().toISOString() });
});

app.use("/api/instagram", instagramRouter);
app.use(handleInstagramError);

app.use((error: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : "Unexpected server error";
  const profileId =
    (typeof req.query.profile === "string" && req.query.profile) ||
    req.header("x-profile-id") ||
    getDefaultProfileId();
  try {
    setProgress(profileId, { phase: "error", error: message, message: "Instagram sync failed." });
  } catch {
    /* ignore */
  }
  res.status(500).json({ error: message });
});

app.listen(PORT, () => {
  const profiles = getConfiguredProfiles();
  console.log(`Content Intel API listening on port ${PORT}`);
  console.log(`CORS origins: ${allowedOrigins.join(", ")}`);
  console.log(
    `Configured profiles: ${profiles.map((profile) => `${profile.id} (${profile.platform})`).join(", ") || "(none)"}`,
  );

  for (const profile of profiles) {
    void loadDataset(profile.id, false).catch((error) => {
      const message = error instanceof Error ? error.message : `Initial sync failed for ${profile.id}`;
      setProgress(profile.id, { phase: "error", error: message, message });
      console.error(`[${profile.id}] ${message}`);
    });
  }
});
