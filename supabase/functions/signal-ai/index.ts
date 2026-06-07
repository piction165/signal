const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const prompts: Record<string, string> = {
  flirt:
    "오프라인 LOL/퀴어 파티 현장에서 처음 만난 사람에게 웃으면서 던질 수 있는 한국어 플러팅 멘트 한 줄을 만들어줘. 부담스럽거나 성적인 표현, 외모 평가, 집요한 느낌은 피하고, 가볍고 센스 있게. 24~38자 한국어 한 문장만.",
  roulette:
    "처음 만난 사람끼리 바로 반응할 수 있는 엉뚱한 한국어 질문 하나를 만들어줘. 예: 사랑으로 2행시 지어보세요. 부담스럽지 않고 웃긴 한 문장만.",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function extractText(data: Record<string, unknown>) {
  if (typeof data.output_text === "string") return data.output_text.trim();
  const output = Array.isArray(data.output) ? data.output : [];

  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = Array.isArray((item as Record<string, unknown>).content)
      ? ((item as Record<string, unknown>).content as Array<Record<string, unknown>>)
      : [];
    for (const part of content) {
      const text = part.text;
      if (typeof text === "string" && text.trim()) return text.trim();
    }
  }

  return "";
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return json({ text: null, error: "missing_openai_key" }, 503);
    }

    const { kind, fallback } = await request.json().catch(() => ({}));
    const prompt = prompts[kind] || prompts.roulette;
    const seed = crypto.randomUUID();
    const model = Deno.env.get("OPENAI_MODEL") || "gpt-4.1-mini";

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "system",
            content:
              "너는 모바일 파티 웹앱의 짧은 한국어 카피를 만든다. 결과는 설명 없이 한 문장만 출력한다.",
          },
          {
            role: "user",
            content: `${prompt}\n이미 준비된 fallback과 다르게 써줘: ${fallback || ""}\nseed: ${seed}`,
          },
        ],
        max_output_tokens: 80,
        temperature: 1.05,
      }),
    });

    if (!response.ok) {
      console.error("OpenAI request failed", response.status, await response.text());
      return json({ text: null, error: "openai_request_failed" }, 502);
    }

    const data = await response.json();
    const text = extractText(data).replace(/^["'“”‘’]+|["'“”‘’]+$/g, "");
    if (!text) return json({ text: null, error: "empty_openai_response" }, 502);

    return json({ text, source: "openai" });
  } catch (error) {
    console.error("signal-ai failed", error);
    return json({ text: null, error: "function_error" }, 500);
  }
});
