# 시그널

Mobile-first party web app preview for real Supabase data.

## What is included

- Blue mobile UI
- People / Play / Signals / Matches / Me bottom navigation
- Notification page
- Supabase browser connection panel
- Real `participants`, `signals`, `matches`, `notifications`, and `game_sessions` reads/writes
- Realtime subscription for notifications, participants, and matches
- Supabase migration in `supabase/migrations/202606061438_signal_schema.sql`

## How to connect real data

1. Create a Supabase project.
2. Run `supabase/migrations/202606061438_signal_schema.sql` in the Supabase SQL editor.
3. Insert a `party_rooms` row with a `room_code`.
4. Insert one or more `participants` rows for that room.
5. Open the GitHub Pages app.
6. Enter:
   - Supabase URL
   - Supabase anon key
   - Room code
   - Current participant id

The app stores this configuration only in browser `localStorage`.

## Notes

This is still a GitHub Pages static preview. Production should move Supabase keys to a Next.js server environment, tighten RLS policies, and move AI Icebreaker generation to a server-side OpenAI endpoint.
