"use client";

import { Fragment, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { BookmarkIcon, TrashIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useChatStore } from "@/lib/store";
import { i18n } from "@/lib/i18n";

export function Sidebar({
  open,
  onOpenChange,
  onNewConversation,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNewConversation: () => void;
}) {
  const conversations = useChatStore((state) => state.conversations);
  const currentId = useChatStore((state) => state.currentId);
  const selectConversation = useChatStore((state) => state.selectConversation);
  const deleteConversation = useChatStore((state) => state.deleteConversation);
  const togglePin = useChatStore((state) => state.togglePin);
  const searchQuery = useChatStore((state) => state.searchQuery);
  const updateSearchQuery = useChatStore((state) => state.updateSearchQuery);

  const filtered = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) return conversations;
    return conversations.filter((conv) => conv.title.toLowerCase().includes(normalized));
  }, [conversations, searchQuery]);

  const content = (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">NovaChat</h2>
          <p className="text-xs text-gray-500">gpt-5-mini</p>
        </div>
        <button
          type="button"
          onClick={() => {
            onNewConversation();
            onOpenChange(false);
          }}
          className="rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
        >
          新規
        </button>
      </div>
      <div className="border-b border-gray-200 px-4 py-3">
        <input
          value={searchQuery}
          onChange={(event) => updateSearchQuery(event.target.value)}
          placeholder={i18n.searchPlaceholder}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="space-y-2">
          {filtered.map((conversation) => (
            <li key={conversation.id}>
              <button
                type="button"
                onClick={() => {
                  selectConversation(conversation.id);
                  onOpenChange(false);
                }}
                className={clsx(
                  "w-full rounded-2xl border px-3 py-3 text-left shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500",
                  conversation.id === currentId
                    ? "border-blue-400 bg-blue-50 text-blue-600"
                    : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{conversation.title}</span>
                  {conversation.pinned && (
                    <BookmarkIcon className="h-4 w-4 text-blue-500" aria-hidden />
                  )}
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                  <span>{new Date(conversation.updatedAt).toLocaleString()}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="rounded-md border border-gray-200 p-1 text-gray-500 transition hover:border-blue-300 hover:text-blue-600"
                      onClick={(event) => {
                        event.stopPropagation();
                        togglePin(conversation.id);
                      }}
                      aria-label={i18n.pinned}
                    >
                      <BookmarkIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-gray-200 p-1 text-gray-500 transition hover:border-red-300 hover:text-red-600"
                      onClick={(event) => {
                        event.stopPropagation();
                        deleteConversation(conversation.id);
                      }}
                      aria-label={i18n.delete}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </button>
            </li>
          ))}
          {!filtered.length && (
            <li className="rounded-2xl border border-dashed border-gray-200 px-3 py-6 text-center text-sm text-gray-500">
              会話がありません
            </li>
          )}
        </ul>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden w-72 border-r border-gray-200 bg-white lg:block">{content}</div>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-40 lg:hidden" onClose={onOpenChange}>
          <Transition.Child
            as={Fragment}
            enter="duration-150 ease-out"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="duration-150 ease-in"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40" />
          </Transition.Child>
          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="duration-200 ease-out"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="duration-150 ease-in"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex h-full w-72 flex-col bg-white shadow-xl">
                {content}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}
