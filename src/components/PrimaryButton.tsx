"use client";

import type { ReactNode } from "react";

type ButtonType = "button" | "submit" | "reset";

type PrimaryButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  type?: ButtonType;  // ← 追加（デフォルトはあとで指定）
};

export function PrimaryButton({
  children,
  onClick,
  type = "button",    // ← デフォルトは今まで通り button
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 active:scale-95 transition"
    >
      {children}
    </button>
  );
}
