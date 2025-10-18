import type { StreamEvent } from "@/lib/types";

const decoder = new TextDecoder();

export async function* fetchEventSourceStream(
  url: string,
  body: unknown,
  signal?: AbortSignal
): AsyncGenerator<StreamEvent> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `HTTP ${response.status}`);
  }

  if (!response.body) {
    throw new Error("レスポンスストリームが利用できません");
  }

  const reader = response.body.getReader();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let boundary = buffer.indexOf("\n\n");
      while (boundary !== -1) {
        const chunk = buffer.slice(0, boundary).trim();
        buffer = buffer.slice(boundary + 2);
        if (chunk.startsWith("data:")) {
          const data = chunk.replace(/^data:\s*/, "");
          if (data === "[DONE]") {
            yield { type: "done" };
          } else {
            try {
              const parsed = JSON.parse(data) as StreamEvent;
              yield parsed;
            } catch (error) {
              console.error("Failed to parse SSE chunk", error);
            }
          }
        }
        boundary = buffer.indexOf("\n\n");
      }
    }
  } finally {
    reader.releaseLock();
  }
}
