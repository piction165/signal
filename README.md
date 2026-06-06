# 시그널

LOL 행사에서 QR로 열어 쓰는 초간단 대화 보조 웹앱입니다. 접속/룸/세션을 전면에 세우지 않고, 바로 옆 사람에게 꺼낼 수 있는 한마디와 공유 버튼을 중심으로 둡니다.

## Included

- Black and white mobile UI
- No visible room code or setup flow
- Immediate conversation prompt on first screen
- Situation cards for first line, awkward moment, this-or-that, and next line
- Share button for passing the app link to someone nearby
- Local saved cards
- Optional Supabase background storage for saved conversation cards
- Optional AI-backed mood card, love signal, and fortune cookie through a Supabase Edge Function
- Migration: `supabase/migrations/202606061438_signal_schema.sql`

## Backend Notes

The frontend uses the internal event key `LOL-EVENT` only as backend metadata. It is not shown in the UI.

AI calls go through `supabase.functions.invoke("signal-ai")`. Do not put an OpenAI key in frontend code.

```bash
supabase functions deploy signal-ai --project-ref iwravorcdoswhssmnzue
supabase secrets set OPENAI_API_KEY=... --project-ref iwravorcdoswhssmnzue
```
