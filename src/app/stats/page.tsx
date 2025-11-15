"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Chart } from "@/components/Chart";
import { useAuth } from "@/contexts/AuthContext";

type StudyLog = {
  id: string;
  subject: string;
  minutes: number;
  createdAt: any;
};

type StackedData = {
  date: string; // YYYY-MM-DD
  subjects: Record<string, number>; // hours by subject
};

function formatDateYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

export default function StatsPage() {
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLogs([]);
      setLoading(false);
      return;
    }
    let unsubscribe: () => void = () => {};

    const nextHandler = (snap: any, sortInMemory = false) => {
      let rows: StudyLog[] = snap.docs
        .map((d: any) => ({
          id: d.id,
          subject: d.data().subject ?? "その他",
          minutes: Number(d.data().minutes ?? 0),
          createdAt: d.data().createdAt,
        }))
        .filter((r: any) => r.createdAt?.toDate);
      if (sortInMemory) {
        rows = rows.sort((a: any, b: any) => {
          const ta = a.createdAt?.toMillis?.() ?? a.createdAt?.toDate?.()?.getTime?.() ?? 0;
          const tb = b.createdAt?.toMillis?.() ?? b.createdAt?.toDate?.()?.getTime?.() ?? 0;
          return ta - tb; // asc
        });
      }
      setLogs(rows);
      setLoading(false);
    };

    try {
      const qOrdered = query(
        collection(db, "study-logs"),
        where("userRef", "==", user.uid),
        orderBy("createdAt", "asc")
      );
      unsubscribe = onSnapshot(
        qOrdered,
        (snap) => nextHandler(snap, false),
        (err) => {
          if ((err as any)?.code === "failed-precondition") {
            const qFallback = query(
              collection(db, "study-logs"),
              where("userRef", "==", user.uid)
            );
            unsubscribe = onSnapshot(qFallback, (snap) => nextHandler(snap, true));
          } else {
            console.error("stats onSnapshot error:", err);
            setLoading(false);
          }
        }
      );
    } catch (e) {
      console.error(e);
      setLoading(false);
    }

    return () => unsubscribe?.();
  }, [user]);

  const chartData: StackedData[] = useMemo(() => {
    const map = new Map<string, Record<string, number>>();

    logs.forEach((log) => {
      const dateKey = formatDateYMD(log.createdAt.toDate());
      const subj = log.subject || "その他";
      const hours = (log.minutes || 0) / 60;
      if (!map.has(dateKey)) map.set(dateKey, {});
      const bucket = map.get(dateKey)!;
      bucket[subj] = (bucket[subj] || 0) + hours;
    });

    const sorted = Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-14) // 最新14日分
      .map(([date, subjects]) => ({ date, subjects }));

    return sorted;
  }, [logs]);

  return (
    <main className="flex items-center justify-center py-4 md:py-8">
      <div className="w-full max-w-4xl bg-slate-800/80 shadow-lg rounded-lg p-4 md:p-6 mx-2 my-4">
        <h1 className="mb-4 text-2xl font-bold text-white">学習時間チャート</h1>
        <p className="text-sm text-slate-300 mb-6">
          学習記録から科目別の学習時間を日ごとに集計し、積み上げ棒グラフで表示します。
        </p>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-slate-400">読み込み中...</div>
        ) : (
          <Chart data={chartData} />
        )}

        {!loading && chartData.length === 0 && (
          <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-300 text-sm">
              💡 ヒント: 学習ページで科目と時間を記録すると、ここに統計が表示されます。
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
