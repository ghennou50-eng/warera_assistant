# War Era Assistant

A small Node.js service intended to connect a ChatGPT workflow to the War Era API.

## Endpoints

- `GET /health` — service health check.
- `GET /api/warera?procedure=...&input=...` — authenticated, read-only tRPC query proxy.

The proxy only accepts GET requests and requires a bearer token. It does not execute game actions or mutations.

## Render environment variables

Set these in the Render service dashboard (never commit them to GitHub):

- `WARERA_API_KEY` — the War Era API key.
- `ASSISTANT_ACCESS_TOKEN` — a separate long random token used to protect this bridge.

## Deploy

- Runtime: Node
- Build command: `npm install`
- Start command: `npm start`

Use Node 20 or newer.

## Important

The exact War Era query procedure names and input schemas must be confirmed from the official API documentation before wiring daily-task features. This service is read-only by design; it does not claim to collect rewards or perform game actions.
