# maxx-next

Multi-provider AI proxy with a built-in admin UI, routing, and usage tracking.

## Features
- Proxy endpoints for Claude, OpenAI, Gemini, and Codex formats
- Admin API and Web UI
- Provider routing, retries, and quotas
- SQLite-backed storage

## Quick Start (Docker)
```
docker pull ghcr.io/bowl42/maxx:latest
docker run --rm -p 9880:9880 ghcr.io/bowl42/maxx:latest
```

## Local Development
Backend:
```
go run cmd/maxx/main.go
```

Frontend:
```
cd web
npm install
npm run dev
```

## Endpoints
- Admin API: http://localhost:9880/admin/
- Web UI: http://localhost:9880/
- WebSocket: ws://localhost:9880/ws
- Claude: http://localhost:9880/v1/messages
- OpenAI: http://localhost:9880/v1/chat/completions
- Codex: http://localhost:9880/v1/responses
- Gemini: http://localhost:9880/v1beta/models/{model}:generateContent

## Data
Default database path: `~/.config/maxx/maxx.db`

