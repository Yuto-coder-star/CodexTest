export type TokenUsage = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

export type StreamTokenEvent = {
  type: "token";
  content?: string;
};

export type StreamUsageEvent = {
  type: "usage";
  usage: TokenUsage;
};

export type StreamErrorEvent = {
  type: "error";
  message?: string;
};

export type StreamDoneEvent = {
  type: "done";
};

export type StreamEvent =
  | StreamTokenEvent
  | StreamUsageEvent
  | StreamErrorEvent
  | StreamDoneEvent;

export type ChatCompletionMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};
