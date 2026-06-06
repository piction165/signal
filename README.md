# 시그널

## What is included

- Black and white mobile UI
- Nickname-first start screen
- Home / Play / Signals / Matches / Me bottom navigation
- Home hierarchy for received signals, sent signals, matches, and notifications
- Received signals reveal the sender's daily nickname
- Real `participants`, `signals`, `matches`, `notifications`, and `game_sessions` reads/writes
- Realtime subscription for notifications, participants, and matches
- Supabase migration in `supabase/migrations/202606061438_signal_schema.sql`

## How to connect real data

1. Create a Supabase project.
2. Run `supabase/migrations/202606061438_signal_schema.sql` in the Supabase SQL editor.
3. Insert a `party_rooms` row with a `room_code`.
4. Insert one or more `participants` rows for that room.
5. Open the GitHub Pages app.
6. Enter a room code and today's nickname.

The app stores the current participant session only in browser `localStorage`.

## Notes

This is still a GitHub Pages static preview. Production should move backend writes to a server route, tighten RLS policies, and move AI Icebreaker generation to a server-side OpenAI endpoint.
