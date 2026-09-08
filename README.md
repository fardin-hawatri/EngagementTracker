# CONTENT INTEL

Instagram Reels intelligence for connected professional accounts. Switch profiles from the top-right control (`mallika.some` / `mallika.some.global`). Facebook can be added later with the same switcher.

## Local start

```bash
npm install
cp .env.example .env
# set INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_ACCESS_TOKEN_GLOBAL
npm run dev
```

This starts:

- API server on `http://127.0.0.1:8787`
- Vite client on `http://localhost:5173` (proxies `/api` to the API)

Open `http://localhost:5173`.

Tokens stay on the server. Do not put them in frontend code.

### Connected profiles

| Profile id | Label | Env token |
|---|---|---|
| `mallika-some` | mallika.some | `INSTAGRAM_ACCESS_TOKEN` |
| `mallika-some-global` | mallika.some.global | `INSTAGRAM_ACCESS_TOKEN_GLOBAL` |

Only profiles with a token set appear in the switcher. To add Facebook later, add an entry in `server/config/profiles.ts` with `platform: "facebook"` and implement the Facebook connector.

## Deploy (Vercel frontend + Render API)

### 1. Deploy API on Render

1. Push this repo to GitHub.
2. In [Render](https://render.com): **New → Web Service** → connect the repo.
3. Settings:
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance:** Free is fine with UptimeRobot
4. Environment variables:
   - `INSTAGRAM_ACCESS_TOKEN` = token for **mallika.some**
   - `INSTAGRAM_ACCESS_TOKEN_GLOBAL` = token for **mallika.some.global**
   - `CORS_ORIGINS` = your Vercel URL(s), comma-separated  
     Example: `https://your-app.vercel.app,https://your-app-git-main-user.vercel.app`
5. Deploy and copy the public URL, e.g. `https://content-intel-api.onrender.com`
6. Confirm health: open `https://YOUR-API.onrender.com/api/health` — should return JSON including configured profiles

### 2. Keep Render awake with UptimeRobot

Free Render services sleep after idle time. Create an [UptimeRobot](https://uptimerobot.com) HTTP(s) monitor:

- **URL:** `https://YOUR-API.onrender.com/api/health`
- **Interval:** every 5 minutes

### 3. Deploy frontend on Vercel

1. In [Vercel](https://vercel.com): **Add New Project** → import the same repo.
2. Framework preset: Vite (auto-detected).
3. Environment variable:
   - `VITE_API_URL` = `https://YOUR-API.onrender.com` (no trailing slash)
4. Deploy.
5. Copy the Vercel URL and add it to Render `CORS_ORIGINS`, then **redeploy the API** (or restart) so CORS picks it up.

### 4. Verify

1. Open the Vercel site.
2. Use the top-right profile control to switch between Instagram accounts.
3. First sync per profile can take a minute or two.
4. If you see a CORS error, the Vercel origin is missing from `CORS_ORIGINS`.
5. If you see a non-JSON API error, `VITE_API_URL` is wrong or the API is down.

## Notes

- Each profile has its own in-memory cache and localStorage overrides.
- Navigation, search, filters, sorting, and theme changes do not call Instagram.
- Use **Refresh Data** to sync the active profile again.
- Redeploy the **frontend** after changing `VITE_API_URL` (Vite bakes env vars in at build time).
