const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const prompts: Record<string, string> = {
  flirt: "LOL 행사장에서 웃으면서 던질 수 있는 한국어 플러팅 멘트 한 줄을 만들어줘. 과하지 않고 짧게.",
  roulette: "처음 만난 사람끼리 바로 반응할 수 있는 엉뚱한 한국어 질문 하나를 만들어줘. 예: 사랑으로 2행시 지어보세요. 한 문장만.",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

    const { kind, fallback } = await request.json();
    const prompt = prompts[kind] || prompts.roulette;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-5.1-mini",
        input: prompt,
        max_output_tokens: 120,
      }),
    });

    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    const text = data.output_text?.trim() || fallback;

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ text: null }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
