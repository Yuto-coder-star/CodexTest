"use client";

import { useMemo, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MessageList } from "@/components/MessageList";
import { Composer } from "@/components/Composer";
import SettingsModal from "@/components/SettingsModal";
import CommandPalette from "@/components/CommandPalette";
import TokenUsageBar from "@/components/TokenUsageBar";
import { useChatStore } from "@/lib/store";
import { useCommandPalette } from "@/lib/hooks";

export default function ChatPage() {
  const currentId = useChatStore((state) => state.currentId);
  const createConversation = useChatStore((state) => state.createConversation);
  const conversations = useChatStore((state) => state.conversations);
  const setSettingsOpen = useChatStore((state) => state.setSettingsOpen);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const commandPalette = useCommandPalette();

  const currentConversation = useMemo(
    () => conversations.find((conv) => conv.id === currentId) ?? null,
    [conversations, currentId]
  );

  return (
    <div className="flex h-screen bg-white">
      <Sidebar
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        onNewConversation={() => createConversation()}
      />
      <main className="flex flex-1 flex-col bg-gray-50">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {currentConversation?.title ?? "新しいチャット"}
            </h1>
            <p className="text-sm text-gray-500">gpt-5-mini • ライトモード専用</p>
          </div>
          <div className="flex items-center gap-2">
            <TokenUsageBar />
            <button
              type="button"
              onClick={() => createConversation()}
              className="rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
              aria-label="新しいチャット"
            >
              新規
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-blue-400 hover:text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
              aria-label="設定"
            >
              設定
            </button>
            <button
              type="button"
              onClick={() => commandPalette.open()}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-blue-400 hover:text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
              aria-label="コマンドパレットを開く"
            >
              Cmd/Ctrl + K
            </button>
          </div>
        </header>
        <div className="flex flex-1 flex-col overflow-hidden">
          <MessageList conversation={currentConversation} />
          <Composer onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        </div>
      </main>
      <SettingsModal />
      <CommandPalette controller={commandPalette} />
    </div>
  );
}
