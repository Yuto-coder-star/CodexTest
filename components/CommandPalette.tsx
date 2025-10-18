"use client";

import { Fragment, useMemo, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useChatStore } from "@/lib/store";
import type { CommandPaletteController } from "@/lib/hooks";
import { i18n } from "@/lib/i18n";

export default function CommandPalette({ controller }: { controller: CommandPaletteController }) {
  const [query, setQuery] = useState("");
  const createConversation = useChatStore((state) => state.createConversation);
  const selectConversation = useChatStore((state) => state.selectConversation);
  const conversations = useChatStore((state) => state.conversations);
  const setSettingsOpen = useChatStore((state) => state.setSettingsOpen);

  const filteredConversations = useMemo(() => {
    if (!query.trim()) return conversations.slice(0, 6);
    return conversations.filter((conv) => conv.title.toLowerCase().includes(query.toLowerCase())).slice(0, 6);
  }, [conversations, query]);

  return (
    <Transition.Root show={controller.isOpen} as={Fragment} afterLeave={() => setQuery("")}>
      <Dialog as="div" className="relative z-50" onClose={controller.close}>
        <Transition.Child
          as={Fragment}
          enter="duration-150 ease-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="duration-150 ease-in"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto p-6">
          <Transition.Child
            as={Fragment}
            enter="duration-150 ease-out"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="duration-150 ease-in"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="mx-auto max-w-lg rounded-2xl border border-gray-200 bg-white shadow-xl">
              <div className="border-b border-gray-200 px-4 py-3">
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={i18n.searchPlaceholder}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="max-h-80 overflow-y-auto py-3">
                <div className="px-4 pb-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">アクション</p>
                </div>
                <ul className="space-y-1 px-4">
                  <li>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-blue-50"
                      onClick={() => {
                        controller.close();
                        setQuery("");
                        const id = createConversation();
                        selectConversation(id);
                      }}
                    >
                      <span>{i18n.newChat}</span>
                      <span className="text-xs text-gray-400">Enter</span>
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-blue-50"
                      onClick={() => {
                        controller.close();
                        setQuery("");
                        setSettingsOpen(true);
                      }}
                    >
                      <span>{i18n.settings}</span>
                      <span className="text-xs text-gray-400">S</span>
                    </button>
                  </li>
                </ul>
                <div className="px-4 pt-4 pb-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">会話</p>
                </div>
                <ul className="space-y-1 px-4">
                  {filteredConversations.length ? (
                    filteredConversations.map((conversation) => (
                      <li key={conversation.id}>
                        <button
                          type="button"
                          className="flex w-full flex-col rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-blue-50"
                          onClick={() => {
                            controller.close();
                            selectConversation(conversation.id);
                          }}
                        >
                          <span className="font-medium text-gray-900">{conversation.title}</span>
                          <span className="text-xs text-gray-400">
                            {new Date(conversation.updatedAt).toLocaleString()}
                          </span>
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="px-3 py-2 text-sm text-gray-500">該当する会話がありません</li>
                  )}
                </ul>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
