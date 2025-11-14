"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Chart } from "@/components/Chart";

type Todo = {
  id: string;
  text: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  done: boolean;
};

export default function StatsPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "todos"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Todo[] = snapshot.docs.map((d) => {
        const docData = d.data();
        return {
          id: d.id,
          text: docData.text ?? "",
          date: docData.date,
          startTime: docData.startTime,
          endTime: docData.endTime,
          done: docData.done ?? false,
        };
      });
      setTodos(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 日付ごとの作業時間を集計
  const chartData = useMemo(() => {
    const dateMap = new Map<string, number>();

    todos.forEach((todo) => {
      if (!todo.date || !todo.startTime || !todo.endTime) return;

      const start = new Date(`${todo.date}T${todo.startTime}`);
      const end = new Date(`${todo.date}T${todo.endTime}`);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

      if (hours > 0 && hours < 24) {
        const current = dateMap.get(todo.date) || 0;
        dateMap.set(todo.date, current + hours);
      }
    });

    // 日付順にソート
    const sorted = Array.from(dateMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-14) // 最新14日分
      .map(([date, hours]) => ({ date, hours }));

    return sorted;
  }, [todos]);

  return (
    <main className="fixed inset-0 bg-slate-900 flex items-center justify-center overflow-hidden pt-16">
      <div className="w-full max-w-4xl bg-slate-800/80 shadow-lg rounded-lg p-4 md:p-6 mx-2 my-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 5rem)' }}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">
            タスク記録チャート
          </h1>
          <Link
            href="/"
            className="text-sm text-blue-400 hover:underline"
          >
            ホームに戻る
          </Link>
        </div>

        <p className="text-sm text-slate-300 mb-6">
          各日付ごとの作業時間を集計したグラフを表示します。
        </p>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-slate-400">
            読み込み中...
          </div>
        ) : (
          <Chart data={chartData} />
        )}

        {/* データがない場合のヒント */}
        {!loading && chartData.length === 0 && (
          <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-300 text-sm">
              💡 ヒント: Todoページで日付と開始・終了時間を設定すると、ここに統計が表示されます。
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
