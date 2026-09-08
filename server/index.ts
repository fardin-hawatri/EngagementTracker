import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { handleInstagramError, instagramRouter } from "./routes/instagram";
import { setProgress } from "./services/cacheService";
import { loadDataset } from "./services/reelService";

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", ".env") });

const app = express();
const PORT = Number(process.env.PORT || 8787);

app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173"] }));
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "content-intel", time: new Date().toISOString() });
});

app.use("/api/instagram", instagramRouter);
app.use(handleInstagramError);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : "Unexpected server error";
  setProgress({ phase: "error", error: message, message: "Instagram sync failed." });
  res.status(500).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`Content Intel API listening on http://127.0.0.1:${PORT}`);
  void loadDataset(false).catch((error) => {
    const message = error instanceof Error ? error.message : "Initial Instagram sync failed";
    setProgress({ phase: "error", error: message, message });
    console.error(message);
  });
});
