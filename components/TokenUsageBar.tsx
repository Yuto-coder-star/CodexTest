"use client";

import { useMemo } from "react";
import { useChatStore } from "@/lib/store";

export default function TokenUsageBar() {
  const currentId = useChatStore((state) => state.currentId);
  const conversations = useChatStore((state) => state.conversations);

  const usage = useMemo(() => {
    const conversation = conversations.find((conv) => conv.id === currentId);
    return conversation?.usage ?? { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
  }, [conversations, currentId]);

  if (!currentId) return null;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm">
      <div className="flex flex-col">
        <span>使用トークン</span>
        <span className="text-sm font-semibold text-gray-900">{usage.totalTokens}</span>
      </div>
      <div className="flex flex-col text-[11px] text-gray-500">
        <span>プロンプト: {usage.promptTokens}</span>
        <span>応答: {usage.completionTokens}</span>
      </div>
    </div>
  );
}
