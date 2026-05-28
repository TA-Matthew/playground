# Expiring participant links (Railway)

## Deploy

1. Connect the repo to Railway (GitHub → Railway).
2. Set **Build command**: `npm run build`
3. Set **Start command**: `npm run start`
4. Add environment variables (see below).
5. Railway serves the Vite `dist/` folder and API routes from the same service.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SHARE_LINK_SECRET` | Yes | Long random string used to sign links. Never expose in the client bundle. |
| `SHARE_CREATE_KEY` | No | If set, `POST /api/share/create` requires `Authorization: Bearer <value>`. |
| `PUBLIC_URL` | No | e.g. `https://your-app.up.railway.app` — used when building signed URLs. Defaults to request host. |
| `PORT` | Auto | Railway sets this; local default is `3000`. |

Copy [.env.example](../.env.example) for local development.

## Local development

```bash
cp .env.example .env
# Edit .env and set SHARE_LINK_SECRET

npm install
npm run dev
```

`npm run dev` runs the API server on port 3000 and Vite on 5173 (proxies `/api` to the server).

## Facilitator flow

1. Open a study with facilitator controls.
2. Click **Copy participant link** → modal opens.
3. Choose **1 day**, **1 week**, or **2 weeks**.
4. Click **Copy link** — a signed URL is created and copied.

## Participant flow

- Opening a signed link runs verification on load.
- Expired or invalid links show a full-page message.
- Unsigned links (no `sig`) still work for backward compatibility.
- Facilitators who unlock via the secret gesture bypass the gate even on signed URLs.
