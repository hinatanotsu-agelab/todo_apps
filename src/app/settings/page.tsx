"use client";

import Link from "next/link";

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="w-full max-w-md bg-slate-800/80 shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">
            設定
          </h1>
          <Link
            href="/"
            className="text-xs text-slate-300 hover:underline"
          >
            ホームに戻る
          </Link>
        </div>

        <div className="space-y-4">
          {/* テーマ設定の例 */}
          <div className="border border-slate-700 rounded-lg p-3">
            <h2 className="text-sm font-semibold text-white mb-1">
              テーマ
            </h2>
            <p className="text-xs text-slate-300 mb-2">
              ダークモード / ライトモードの切り替え（今は見た目だけ）。
            </p>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs rounded bg-slate-700 text-slate-100">
                ダーク
              </button>
              <button className="px-3 py-1 text-xs rounded bg-slate-600 text-slate-100/70">
                ライト（仮）
              </button>
            </div>
          </div>

          {/* 通知設定の例（今はダミー） */}
          <div className="border border-slate-700 rounded-lg p-3">
            <h2 className="text-sm font-semibold text-white mb-1">
              通知
            </h2>
            <p className="text-xs text-slate-300 mb-2">
              将来的に、リマインド通知などの設定をここで行う想定です。
            </p>
            <p className="text-xs text-slate-500">
              ※ 現在はダミー表示のみ
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
