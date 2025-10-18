"use client";

import { useEffect, useRef } from "react";
import { ArrowPathIcon, PencilIcon, StopCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Markdown } from "@/components/Markdown";
import type { Conversation, Message } from "@/lib/store";
import { useChatStore } from "@/lib/store";
import { i18n } from "@/lib/i18n";

export function MessageList({ conversation }: { conversation: Conversation | null }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const streaming = useChatStore((state) => state.streaming);
  const startEditing = useChatStore((state) => state.startEditing);
  const deleteMessage = useChatStore((state) => state.deleteMessage);
  const regenerateMessage = useChatStore((state) => state.regenerateMessage);
  const stopStreaming = useChatStore((state) => state.stopStreaming);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [conversation?.messages.length]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto bg-gray-50 px-4 py-6">
      {!conversation || conversation.messages.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center text-center text-sm text-gray-500">
          <p>まだメッセージがありません。</p>
          <p>下部の入力欄からメッセージを送信してください。</p>
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          {conversation.messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              conversationId={conversation.id}
              isStreaming={streaming?.messageId === message.id}
              onEdit={() => startEditing(message.id, message.content)}
              onDelete={() => deleteMessage(conversation.id, message.id)}
              onRegenerate={() => regenerateMessage(conversation.id, message.id)}
              onStop={() => stopStreaming()}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MessageBubble({
  message,
  isStreaming,
  onEdit,
  onDelete,
  onRegenerate,
  onStop,
}: {
  message: Message;
  isStreaming: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onRegenerate: () => void;
  onStop: () => void;
}) {
  const isUser = message.role === "user";

  return (
    <div className={clsx("flex w-full", isUser ? "justify-end" : "justify-start")}
      aria-live={isStreaming ? "polite" : undefined}
    >
      <div
        className={clsx(
          "max-w-full rounded-2xl border px-5 py-4 shadow-sm",
          isUser
            ? "bg-blue-100 text-gray-900"
            : "bg-gray-100 text-gray-900 border-gray-200"
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 text-sm leading-relaxed">
            {message.error ? (
              <p className="text-sm text-red-600">{message.error}</p>
            ) : (
              <Markdown content={message.content || "..."} />
            )}
          </div>
          <div className="flex flex-col items-end gap-2 text-xs text-gray-500">
            <time>{new Date(message.createdAt).toLocaleTimeString()}</time>
            <div className="flex items-center gap-1">
              {isStreaming && (
                <button
                  type="button"
                  onClick={onStop}
                  className="rounded-md border border-red-200 p-1 text-red-600 transition hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
                  aria-label={i18n.stop}
                >
                  <StopCircleIcon className="h-4 w-4" />
                </button>
              )}
              {isUser ? (
                <>
                  <button
                    type="button"
                    onClick={onEdit}
                    className="rounded-md border border-gray-200 p-1 text-gray-600 transition hover:border-blue-300 hover:text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                    aria-label={i18n.edit}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onDelete}
                    className="rounded-md border border-gray-200 p-1 text-gray-600 transition hover:border-red-300 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
                    aria-label={i18n.delete}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onRegenerate}
                    className="rounded-md border border-gray-200 p-1 text-gray-600 transition hover:border-blue-300 hover:text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                    aria-label={i18n.regenerate}
                  >
                    <ArrowPathIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onDelete}
                    className="rounded-md border border-gray-200 p-1 text-gray-600 transition hover:border-red-300 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
                    aria-label={i18n.delete}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
