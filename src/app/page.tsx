// app/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card } from "@/components/Card";
import { useAuth } from "@/contexts/AuthContext";

type Feature = {
  title: string;
  description: string;
  tag?: string;
  href: string;
};

const features: Feature[] = [
  {
    title: "Todo 管理",
    description: "タスクの追加・編集・完了状態を管理できます。",
    tag: "タスク",
    href: "/todo",
  },
  {
    title: "タスク記録チャート",
    description: "日ごとの作業時間をグラフで確認できます。（開発中）",
    tag: "可視化",
    href: "/stats",
  },
  {
    title: "設定",
    description: "テーマや通知など、アプリの設定を行います。（仮）",
    tag: "設定",
    href: "/settings",
  },
];

export default function HomePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">読み込み中...</div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="fixed inset-0 bg-slate-900 flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-2xl px-4 py-8 overflow-y-auto max-h-screen">
        <h1 className="text-2xl font-bold text-white mb-2 text-center">
          ダッシュボード
        </h1>
        <p className="text-sm text-slate-300 mb-6 text-center">
          使いたい機能を選んでください
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {features.map((feature) => (
            <Link key={feature.href} href={feature.href}>
              {/* Card 全体をクリックできるようにする */}
              <div className="hover:-translate-y-0.5 hover:shadow-lg transition">
                <Card
                  title={feature.title}
                  description={feature.description}
                  tag={feature.tag}
                >
                  <button className="inline-flex items-center rounded-md bg-blue-500 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-600">
                    開く
                  </button>
                </Card>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
