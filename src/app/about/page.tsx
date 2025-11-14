"use client";

import Link from "next/link";
import { PrimaryButton } from "@/components/PrimaryButton";

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-800">
      <h1 className="text-3xl font-bold text-white">About</h1>
      <p className="mt-4 text-gray-300">
        これは Next.js のテスト用 About ページです。
      </p>

      <div className="mt-6">
        <Link href="/">
          <PrimaryButton>Home に戻る</PrimaryButton>
        </Link>
      </div>
    </main>
  );
}
