const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type SignalMessage = {
  role: "user" | "assistant";
  content: string;
};

type SignalRequest = {
  mode?: "love" | "cookie" | "questions";
  messages?: SignalMessage[];
  context?: {
    event?: string;
    nickname?: string;
    interests?: string[];
  };
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function buildPrompt({ mode, messages = [], context = {} }: SignalRequest) {
  const base = [
    `Event: ${context.event || "LOL Signal"}`,
    `Participant nickname: ${context.nickname || "익명"}`,
    `Interests: ${(context.interests || []).join(", ") || "unknown"}`,
  ].join("\n");

  if (mode === "love") {
    return `${base}\n\n오늘 행사 현장에서 바로 볼 수 있는 연애운을 한국어로 2문장 이내로 써줘. 너무 진지하지 않게, 살짝 설레고 위트 있게.`;
  }

  if (mode === "cookie") {
    return `${base}\n\n포춘쿠키처럼 짧은 한 줄을 한국어로 써줘. 시그널, 용기, 우연한 대화 중 하나의 느낌을 담아.`;
  }

  const transcript = messages
    .slice(-8)
    .map((message) => `${message.role}: ${message.content}`)
    .join("\n");

  return `${base}

You are running a lightweight question roulette inside an offline event.
Generate exactly one Korean question that helps two strangers start talking.
Keep it short, warm, specific, and low-pressure.
Avoid long explanations, pickup artist tone, sexual content, or therapy-like questions.

Conversation so far:
${transcript || "No prior messages."}`;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) return json({ error: "OPENAI_API_KEY is not configured" }, 500);

  let body: SignalRequest;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const mode = body.mode || "questions";
  const input = buildPrompt({ ...body, mode });

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-5.2",
      input,
      instructions:
        "You write concise Korean micro-interactions for an event social app. Output only the user-facing text.",
      max_output_tokens: 180,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return json({ error: "OpenAI request failed", detail: errorText }, 502);
  }

  const data = await response.json();
  const text =
    data.output_text ||
    data.output?.flatMap((item: { content?: Array<{ text?: string }> }) => item.content || [])
      .map((content: { text?: string }) => content.text)
      .filter(Boolean)
      .join("\n")
      .trim();

  return json({ text });
});
