"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import toast from "react-hot-toast";
import { fetchEventSourceStream } from "@/lib/sse";
import type { StreamEvent, TokenUsage } from "@/lib/types";
import { ChatRequestSchema } from "@/lib/schema";
import { z } from "zod";

export type Role = "user" | "assistant";

export type Message = {
  id: string;
  role: Role;
  content: string;
  createdAt: string;
  error?: string;
};

export type Conversation = {
  id: string;
  title: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  usage: TokenUsage;
};

export type StreamingState = {
  conversationId: string;
  messageId: string;
  abortController: AbortController;
};

type ComposerState = {
  input: string;
  isLocked: boolean;
  editingMessageId: string | null;
};

type ChatState = {
  conversations: Conversation[];
  currentId: string | null;
  searchQuery: string;
  settings: {
    temperature: number;
    maxTokens: number;
    model: string;
  };
  isSettingsOpen: boolean;
  hydrated: boolean;
  streaming?: StreamingState;
  composer: ComposerState;
  createConversation: () => string;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  togglePin: (id: string) => void;
  updateConversationTitle: (id: string, title: string) => void;
  updateSearchQuery: (value: string) => void;
  setHydrated: (value: boolean) => void;
  setTemperature: (value: number) => void;
  setMaxTokens: (value: number) => void;
  setSettingsOpen: (open: boolean) => void;
  setComposerInput: (value: string) => void;
  startEditing: (messageId: string, initial: string) => void;
  cancelEditing: () => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessageContent: (conversationId: string, messageId: string, content: string) => void;
  markMessageError: (conversationId: string, messageId: string, error: string) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;
  setUsage: (conversationId: string, usage: TokenUsage) => void;
  startStreaming: (streaming: StreamingState) => void;
  stopStreaming: () => void;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  regenerateMessage: (conversationId: string, messageId: string) => Promise<void>;
};

const defaultUsage: TokenUsage = {
  promptTokens: 0,
  completionTokens: 0,
  totalTokens: 0,
};

const createConversation = (): Conversation => {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  return {
    id,
    title: "新しいチャット",
    pinned: false,
    createdAt: now,
    updatedAt: now,
    messages: [],
    usage: { ...defaultUsage },
  };
};

const getConversationMessages = (conversation: Conversation) =>
  conversation.messages
    .filter((message) => !(message.role === "assistant" && message.content.length === 0))
    .map((message) => ({
      role: message.role,
      content: message.content,
    }));

const parseStreamEvent = (json: unknown): StreamEvent => {
  const schema = z.discriminatedUnion("type", [
    z.object({ type: z.literal("token"), content: z.string().optional() }),
    z.object({ type: z.literal("usage"), usage: z.object({ promptTokens: z.number(), completionTokens: z.number(), totalTokens: z.number() }) }),
    z.object({ type: z.literal("error"), message: z.string().optional() }),
    z.object({ type: z.literal("done") }),
  ]);
  return schema.parse(json);
};

const initialConversation = createConversation();

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [initialConversation],
      currentId: initialConversation.id,
      searchQuery: "",
      settings: {
        temperature: 0.7,
        maxTokens: 1024,
        model: "gpt-5-mini",
      },
      isSettingsOpen: false,
      hydrated: false,
      composer: {
        input: "",
        isLocked: false,
        editingMessageId: null,
      },
      createConversation: () => {
        const conversation = createConversation();
        set((state) => ({
          conversations: [conversation, ...state.conversations],
          currentId: conversation.id,
          composer: { ...state.composer, input: "", editingMessageId: null },
        }));
        return conversation.id;
      },
      selectConversation: (id) => {
        set((state) => ({
          currentId: id,
          composer: { ...state.composer, input: "", editingMessageId: null },
        }));
      },
      deleteConversation: (id) => {
        set((state) => {
          const remaining = state.conversations.filter((conv) => conv.id !== id);
          if (!remaining.length) {
            remaining.push(createConversation());
          }
          const currentId = state.currentId === id ? remaining[0]?.id ?? null : state.currentId;
          return {
            conversations: remaining,
            currentId,
          };
        });
      },
      togglePin: (id) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === id ? { ...conv, pinned: !conv.pinned } : conv
          ),
        }));
      },
      updateConversationTitle: (id, title) => {
        const now = new Date().toISOString();
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === id ? { ...conv, title, updatedAt: now } : conv
          ),
        }));
      },
      updateSearchQuery: (value) => set(() => ({ searchQuery: value })),
      setHydrated: (value) => set(() => ({ hydrated: value })),
      setTemperature: (value) =>
        set((state) => ({ settings: { ...state.settings, temperature: value } })),
      setMaxTokens: (value) =>
        set((state) => ({ settings: { ...state.settings, maxTokens: value } })),
      setSettingsOpen: (open) => set(() => ({ isSettingsOpen: open })),
      setComposerInput: (value) =>
        set((state) => ({ composer: { ...state.composer, input: value } })),
      startEditing: (messageId, initial) => {
        set((state) => ({
          composer: {
            ...state.composer,
            input: initial,
            editingMessageId: messageId,
          },
        }));
      },
      cancelEditing: () =>
        set((state) => ({
          composer: { ...state.composer, editingMessageId: null, input: "" },
        })),
      addMessage: (conversationId, message) => {
        const now = new Date().toISOString();
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, message],
                  updatedAt: now,
                }
              : conv
          ),
        }));
      },
      updateMessageContent: (conversationId, messageId, content) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: conv.messages.map((msg) =>
                    msg.id === messageId ? { ...msg, content } : msg
                  ),
                }
              : conv
          ),
        }));
      },
      markMessageError: (conversationId, messageId, error) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: conv.messages.map((msg) =>
                    msg.id === messageId ? { ...msg, error } : msg
                  ),
                }
              : conv
          ),
        }));
      },
      deleteMessage: (conversationId, messageId) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? { ...conv, messages: conv.messages.filter((msg) => msg.id !== messageId) }
              : conv
          ),
        }));
      },
      setUsage: (conversationId, usage) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId ? { ...conv, usage } : conv
          ),
        }));
      },
      startStreaming: (streaming) =>
        set((state) => ({
          streaming,
          composer: { ...state.composer, isLocked: true },
        })),
      stopStreaming: () => {
        const streaming = get().streaming;
        if (streaming) {
          streaming.abortController.abort();
        }
        set((state) => ({
          streaming: undefined,
          composer: { ...state.composer, isLocked: false },
        }));
      },
      sendMessage: async (conversationId, content) => {
        const state = get();
        const conversation = state.conversations.find((conv) => conv.id === conversationId);
        if (!conversation) {
          toast.error("会話が見つかりません");
          return;
        }

        if (!content.trim()) {
          toast.error("メッセージが空です");
          return;
        }

        const userMessageId = state.composer.editingMessageId ?? crypto.randomUUID();
        let baseMessages = conversation.messages;

        if (state.composer.editingMessageId) {
          const targetIndex = baseMessages.findIndex((msg) => msg.id === state.composer.editingMessageId);
          if (targetIndex === -1) {
            toast.error("編集対象のメッセージが見つかりません");
            return;
          }
          const trimmed = baseMessages.slice(0, targetIndex);
          baseMessages = [
            ...trimmed,
            {
              ...baseMessages[targetIndex],
              content,
            },
          ];

          set((store) => ({
            conversations: store.conversations.map((conv) =>
              conv.id === conversationId
                ? {
                    ...conv,
                    title:
                      conv.messages[targetIndex].role === "user" && conv.title === "新しいチャット"
                        ? content.slice(0, 24) || conv.title
                        : conv.title,
                    messages: baseMessages,
                    updatedAt: new Date().toISOString(),
                  }
                : conv
            ),
            composer: { ...store.composer, input: "", editingMessageId: null },
          }));
        } else {
          set((store) => ({
            conversations: store.conversations.map((conv) =>
              conv.id === conversationId
                ? {
                    ...conv,
                    messages: [
                      ...conv.messages,
                      {
                        id: userMessageId,
                        role: "user",
                        content,
                        createdAt: new Date().toISOString(),
                      },
                    ],
                    title:
                      conv.title === "新しいチャット"
                        ? content.slice(0, 24) || conv.title
                        : conv.title,
                    updatedAt: new Date().toISOString(),
                  }
                : conv
            ),
            composer: { ...store.composer, input: "" },
          }));
        }

        const assistantMessageId = crypto.randomUUID();
        const getMessagesForRequest = () => {
          const conv = get().conversations.find((c) => c.id === conversationId);
          if (!conv) return [];
          return getConversationMessages(conv);
        };

        set((store) => ({
          conversations: store.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: [
                    ...conv.messages,
                    {
                      id: assistantMessageId,
                      role: "assistant",
                      content: "",
                      createdAt: new Date().toISOString(),
                    },
                  ],
                  updatedAt: new Date().toISOString(),
                }
              : conv
          ),
        }));

        const abortController = new AbortController();
        get().startStreaming({ conversationId, messageId: assistantMessageId, abortController });

        try {
          const payload = {
            messages: getMessagesForRequest(),
            temperature: state.settings.temperature,
            max_tokens: state.settings.maxTokens,
          };
          ChatRequestSchema.parse(payload);

          const stream = fetchEventSourceStream("/api/chat", payload, abortController.signal);
          let assistantContent = "";

          for await (const event of stream) {
            const parsed = parseStreamEvent(event);
            if (parsed.type === "token") {
              if (parsed.content) {
                assistantContent += parsed.content;
                get().updateMessageContent(conversationId, assistantMessageId, assistantContent);
              }
            }
            if (parsed.type === "usage") {
              get().setUsage(conversationId, parsed.usage);
            }
            if (parsed.type === "error" && parsed.message) {
              get().markMessageError(conversationId, assistantMessageId, parsed.message);
              toast.error(parsed.message);
            }
          }
        } catch (error) {
          const isAbort = error instanceof DOMException && error.name === "AbortError";
          if (!isAbort) {
            console.error(error);
            const message =
              error instanceof Error ? error.message : "予期せぬエラーが発生しました";
            get().markMessageError(conversationId, assistantMessageId, message);
            toast.error(message);
          }
        } finally {
          get().stopStreaming();
        }
      },
      regenerateMessage: async (conversationId, messageId) => {
        const state = get();
        const conversation = state.conversations.find((conv) => conv.id === conversationId);
        if (!conversation) return;
        const targetIndex = conversation.messages.findIndex((msg) => msg.id === messageId);
        if (targetIndex === -1) return;

        const userMessage = [...conversation.messages]
          .slice(0, targetIndex)
          .reverse()
          .find((msg) => msg.role === "user");

        if (!userMessage) {
          toast.error("再生成できるユーザーメッセージがありません");
          return;
        }

        set((store) => ({
          conversations: store.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: conv.messages.slice(0, targetIndex).filter((msg) => msg.role !== "assistant" || msg.id !== messageId),
                }
              : conv
          ),
        }));

        set((store) => ({
          composer: {
            ...store.composer,
            editingMessageId: userMessage.id,
            input: userMessage.content,
          },
        }));

        await get().sendMessage(conversationId, userMessage.content);
      },
    }),
    {
      name: "novachat-store",
      version: 1,
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
        if (state && !state.currentId && state.conversations.length) {
          state.selectConversation(state.conversations[0].id);
        }
      },
    }
  )
);

export const hydrateChatStore = () => useChatStore.persist?.rehydrate();
