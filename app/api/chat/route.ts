import { NextRequest } from "next/server";
import { openai } from "@/lib/openai";
import { ChatRequestSchema } from "@/lib/schema";
import type { TokenUsage } from "@/lib/types";

export const runtime = "edge";

const encoder = new TextEncoder();

function formatSSE(data: unknown) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(formatSSE({ type: "error", message: "OPENAI_API_KEY が未設定です" }), {
      status: 500,
      headers: {
        "Content-Type": "text/event-stream",
      },
    });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "不正なJSONです" }), { status: 400 });
  }

  const parsed = ChatRequestSchema.safeParse(json);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), { status: 400 });
  }

  const { messages, temperature, max_tokens, system } = parsed.data;
  const requestMessages = system
    ? [{ role: "system" as const, content: system }, ...messages]
    : messages;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      stream: true,
      temperature,
      max_tokens,
      messages: requestMessages,
    });

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        let usage: TokenUsage | null = null;
        try {
          for await (const chunk of completion) {
            const choice = chunk.choices[0];
            if (choice?.delta?.content) {
              controller.enqueue(encoder.encode(formatSSE({ type: "token", content: choice.delta.content })));
            }
            if (chunk.usage) {
              usage = {
                promptTokens: chunk.usage.prompt_tokens ?? 0,
                completionTokens: chunk.usage.completion_tokens ?? 0,
                totalTokens: chunk.usage.total_tokens ?? 0,
              };
            }
          }
          if (usage) {
            controller.enqueue(encoder.encode(formatSSE({ type: "usage", usage })));
          }
          controller.enqueue(encoder.encode(formatSSE({ type: "done" })));
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "ストリーミング中にエラーが発生しました";
          controller.enqueue(encoder.encode(formatSSE({ type: "error", message })));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "チャット生成に失敗しました";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
