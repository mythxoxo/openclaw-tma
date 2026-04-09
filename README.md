# OpenClaw TMA

Telegram Mini App frontend for connecting directly to a user-owned OpenClaw Gateway.

## Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand
- @tanstack/react-query
- Telegram WebApp SDK

## Run locally
```bash
cd frontend
npm install
npm run dev
```

## Gateway requirements (for user-owned Gateway)
Gateway must:
- Use HTTPS / WSS (Telegram blocks mixed-content HTTP/WS)
- Allow CORS for `https://myclawbot.xyz`
  - `Access-Control-Allow-Origin: https://myclawbot.xyz`
  - `Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS`
  - `Access-Control-Allow-Headers: Authorization, Content-Type`
- Accept token in WS URL query param: `wss://host?token=<token>`
- Send JSON WS events compatible with the app contract (`message_chunk`, `message_done`, `tool_call`, `tool_result`, `agent_status`, `log_entry`, `pong`)

## Deployment
Push to GitHub and Vercel auto-deploys from the default branch to `https://myclawbot.xyz`.
