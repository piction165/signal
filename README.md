# Signal

GitHub Pages only static web app for LOL event conversation games.

## Features

- Landscape-first mobile layout
- Love tarot draw
- Celebrity ideal-type 16 tournament
- Flirting line draw
- Weird question roulette
- Share button
- Share QR generated from the current GitHub Pages URL
- Optional OpenAI generation through `supabase/functions/signal-ai`

No login or name input is required. Do not put an OpenAI API key in frontend code. If AI generation is used, deploy the Supabase Edge Function and set `OPENAI_API_KEY` as a server secret.
