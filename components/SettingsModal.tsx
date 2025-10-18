"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useChatStore } from "@/lib/store";
import { i18n } from "@/lib/i18n";

export default function SettingsModal() {
  const isOpen = useChatStore((state) => state.isSettingsOpen);
  const setOpen = useChatStore((state) => state.setSettingsOpen);
  const temperature = useChatStore((state) => state.settings.temperature);
  const maxTokens = useChatStore((state) => state.settings.maxTokens);
  const setTemperature = useChatStore((state) => state.setTemperature);
  const setMaxTokens = useChatStore((state) => state.setMaxTokens);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setOpen}>
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
            <Dialog.Panel className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
              <Dialog.Title className="text-lg font-semibold text-gray-900">{i18n.settings}</Dialog.Title>
              <Dialog.Description className="mt-2 text-sm text-gray-500">
                モデルパラメーターと表示設定を調整します。
              </Dialog.Description>
              <div className="mt-6 space-y-6">
                <div>
                  <label className="flex items-center justify-between text-sm font-medium text-gray-700">
                    <span>モデル</span>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600">
                      gpt-5-mini
                    </span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="temperature">
                    温度 (創造性)
                  </label>
                  <input
                    id="temperature"
                    type="range"
                    min={0}
                    max={2}
                    step={0.1}
                    value={temperature}
                    onChange={(event) => setTemperature(parseFloat(event.target.value))}
                    className="mt-2 w-full"
                  />
                  <p className="mt-1 text-sm text-gray-500">現在: {temperature.toFixed(1)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="maxTokens">
                    最大トークン
                  </label>
                  <input
                    id="maxTokens"
                    type="number"
                    min={16}
                    max={4096}
                    step={16}
                    value={maxTokens}
                    onChange={(event) => setMaxTokens(Number(event.target.value))}
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-gray-300 hover:text-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                  onClick={() => setOpen(false)}
                >
                  閉じる
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
