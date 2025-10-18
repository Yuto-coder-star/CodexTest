"use client";

import { ReactNode, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { hydrateChatStore } from "@/lib/store";

export default function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    hydrateChatStore();
  }, []);

  return (
    <>
      {children}
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
    </>
  );
}
