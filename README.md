# 시그널

## What is included

- Black and white mobile UI
- Nickname-first start screen
- LOL event-only QR entry flow with no visible room code
- Home / Play / Signals / Me bottom navigation
- Home hierarchy for received signals, sent signals, saved play results, and notifications
- Received signals reveal the sender's daily nickname
- Mini-games open as short modal interactions instead of full-page game screens
- AI-backed love fortune, fortune cookie, and chat-style question roulette through a Supabase Edge Function
- Real `participants`, `signals`, `matches`, `notifications`, and `game_sessions` reads/writes
- Realtime subscription for notifications, participants, and matches
- Supabase migration in `supabase/migrations/202606061438_signal_schema.sql`

## How to connect real data

1. Create a Supabase project.
2. Run `supabase/migrations/202606061438_signal_schema.sql` in the Supabase SQL editor.
3. The app creates/uses the internal event key `LOL-EVENT`.
4. Insert one or more `participants` rows for that event if you want preloaded test users.
5. Open the GitHub Pages app.
6. Enter today's nickname.

The app stores the current participant session only in browser `localStorage`.

## AI function

The frontend calls `supabase.functions.invoke("signal-ai")`. Do not put an OpenAI key in frontend code.

Deploy the Edge Function and set the key as a Supabase secret:

```bash
supabase functions deploy signal-ai --project-ref iwravorcdoswhssmnzue
supabase secrets set OPENAI_API_KEY=... --project-ref iwravorcdoswhssmnzue
```

The function uses OpenAI's Responses API for text generation and stores user-facing results back into `game_sessions`.

## Notes

This is still a GitHub Pages static preview. Production should move backend writes to a server route, tighten RLS policies, and move AI Icebreaker generation to a server-side OpenAI endpoint.
