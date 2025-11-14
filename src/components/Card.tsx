"use client";

import type { ReactNode } from "react";

type CardProps = {
  title: string;
  description: string;
  tag?: string;
  children?: ReactNode;
};

export function Card({ title, description, tag, children }: CardProps) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
      {tag && (
        <span className="mb-2 inline-flex rounded-full bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-200">
          {tag}
        </span>
      )}
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm text-slate-300">{description}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
