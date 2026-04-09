# OpenClaw TMA v6.0

Telegram Mini App for direct connection to a user-owned OpenClaw Gateway (no backend in this repository).

## Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand
- @tanstack/react-query
- @twa-dev/sdk

## Run locally
```bash
cd frontend
npm install
npm run dev
```

## Deploy
This repo is intended for Vercel deployment on `https://myclawbot.xyz`.

## User Gateway requirements
Your Gateway must:
- Work over **HTTPS/WSS** (Telegram blocks mixed content).
- Allow CORS for `https://myclawbot.xyz`:
  - `Access-Control-Allow-Origin: https://myclawbot.xyz`
  - `Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS`
  - `Access-Control-Allow-Headers: Authorization, Content-Type`
- Accept token in WS URL query param:
  - `wss://host?token=<token>`
- Emit WS events in JSON format:
  - `message_chunk`, `message_done`, `tool_call`, `tool_result`, `agent_status`, `log_entry`, `pong`

## Security notes
- Gateway URL and API token are stored in **sessionStorage** (not localStorage).
- REST calls use `Authorization: Bearer <token>`.
- WebSocket auth uses `?token=<token>`.
