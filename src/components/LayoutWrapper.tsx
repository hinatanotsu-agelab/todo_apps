"use client";

import { ReactNode } from "react";
import { AppBar } from "@/components/AppBar";

export function LayoutWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-900">
      <AppBar />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
