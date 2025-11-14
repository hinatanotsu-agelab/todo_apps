"use client";

import Link from "next/link";

export default function StatsPage() {
  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="w-full max-w-xl bg-slate-800/80 shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">
            タスク記録チャート
          </h1>
          <Link
            href="/"
            className="text-xs text-slate-300 hover:underline"
          >
            ホームに戻る
          </Link>
        </div>

        <p className="text-sm text-slate-300 mb-4">
          各日付ごとの作業時間を集計して、グラフ表示するページです。
          今はまだひな形なので、この中にチャートコンポーネントを追加していきます。
        </p>

        <div className="rounded-lg border border-slate-600 bg-slate-900/60 p-4">
          <p className="text-xs text-slate-400 mb-2">
            （ここに棒グラフ / 折れ線グラフを表示するイメージ）
          </p>
          <div className="h-40 flex items-center justify-center text-slate-500 text-xs border border-dashed border-slate-600 rounded">
            チャートコンポーネントをここに配置
          </div>
        </div>
      </div>
    </main>
  );
}
