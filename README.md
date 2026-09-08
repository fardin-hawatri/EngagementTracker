# CONTENT INTEL

Instagram Reels intelligence for the connected professional account.

## Start

```bash
npm install
npm run dev
```

This starts:

- API server on `http://127.0.0.1:8787`
- Vite client on `http://localhost:5173`

Open `http://localhost:5173`.

The Instagram access token stays on the server. Do not put it in frontend code.

## Notes

- First load fetches account media and Reel insights, then caches them in memory.
- Navigation, search, filters, sorting, and theme changes do not call Instagram.
- Use **Refresh Data** to sync again.
