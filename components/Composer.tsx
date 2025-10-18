"use client";

import { FormEvent, KeyboardEvent, useCallback } from "react";
import { PaperAirplaneIcon, Bars3Icon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useChatStore } from "@/lib/store";
import { i18n } from "@/lib/i18n";

export function Composer({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const currentId = useChatStore((state) => state.currentId);
  const createConversation = useChatStore((state) => state.createConversation);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const composer = useChatStore((state) => state.composer);
  const setComposerInput = useChatStore((state) => state.setComposerInput);

  const handleSubmit = useCallback(
    async (event?: FormEvent) => {
      event?.preventDefault();
      const content = composer.input;
      if (!content.trim()) return;
      let conversationId = currentId;
      if (!conversationId) {
        conversationId = createConversation();
      }
      await sendMessage(conversationId, content);
    },
    [composer.input, createConversation, currentId, sendMessage]
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3 shadow-inner">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex w-full max-w-3xl items-end gap-2"
        aria-label="チャットメッセージ入力フォーム"
      >
        <button
          type="button"
          onClick={onToggleSidebar}
          className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-600 shadow-sm transition hover:border-blue-300 hover:text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 lg:hidden"
          aria-label="サイドバーを開閉"
        >
          <Bars3Icon className="h-5 w-5" />
        </button>
        <div className="flex-1 rounded-2xl border border-gray-300 bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
          <textarea
            value={composer.input}
            onChange={(event) => setComposerInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={i18n.promptPlaceholder}
            rows={1}
            className="h-12 w-full resize-none rounded-2xl bg-transparent px-4 py-3 text-sm text-gray-900 focus:outline-none"
            aria-label="メッセージ"
            disabled={composer.isLocked}
          />
        </div>
        <button
          type="submit"
          disabled={composer.isLocked || !composer.input.trim()}
          className={clsx(
            "inline-flex items-center justify-center rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500",
            composer.isLocked || !composer.input.trim() ? "opacity-60" : "hover:bg-blue-600"
          )}
          aria-label={i18n.send}
        >
          {composer.isLocked ? (
            <svg
              className="h-5 w-5 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              role="status"
              aria-label="送信中"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          ) : (
            <PaperAirplaneIcon className="h-5 w-5" />
          )}
        </button>
      </form>
      <p className="mx-auto mt-2 max-w-3xl text-xs text-gray-500">
        Enterで送信 • Shift + Enterで改行 • Ctrl/Cmd + Kでコマンドパレット
      </p>
    </div>
  );
}
