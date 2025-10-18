import { z } from "zod";

export const ChatMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string().min(1),
});

export const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1),
  temperature: z.number().min(0).max(2).default(0.7),
  max_tokens: z.number().min(16).max(4096).default(1024),
  system: z.string().optional(),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;
