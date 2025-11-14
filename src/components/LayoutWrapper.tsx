"use client";

import { ReactNode } from "react";
import { AppBar } from "@/components/AppBar";

export function LayoutWrapper({ children }: { children: ReactNode }) {
  return (
    <>
      <AppBar />
      {children}
    </>
  );
}
