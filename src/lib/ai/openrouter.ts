const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenRouterOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

const DEFAULT_MODEL = "qwen/qwen3-235b-a22b";

export async function generateCompletion(
  messages: ChatMessage[],
  options: OpenRouterOptions = {}
): Promise<string> {
  const {
    model = DEFAULT_MODEL,
    temperature = 0.7,
    maxTokens = 2048,
  } = options;

  const res = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "TrueRex Local",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      // Tell Qwen to skip internal reasoning and just give the answer
      chat_template_kwargs: { enable_thinking: false },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices[0]?.message?.content?.trim() || "";
}

export async function generateStream(
  messages: ChatMessage[],
  options: OpenRouterOptions = {}
): Promise<ReadableStream<Uint8Array>> {
  const {
    model = DEFAULT_MODEL,
    temperature = 0.7,
    maxTokens = 2048,
  } = options;

  const res = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "TrueRex Local",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
      chat_template_kwargs: { enable_thinking: false },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter stream error ${res.status}: ${err}`);
  }

  return res.body!;
}
