"use client";

import { useState, FormEvent, useEffect } from "react";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { BackLink } from "@/components/BackLink";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type StudyLog = {
  id: string;
  subject: string;
  minutes: number;
  memo: string;
  createdAt: any;
};

const SUBJECT_OPTIONS = ["数学", "英語", "情報", "物理", "化学", "その他"];

export default function StudyPage() {
  const [subject, setSubject] = useState("英語");
  const [minutes, setMinutes] = useState("");
  const [memo, setMemo] = useState("");
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [errors, setErrors] = useState<{ subject?: string; minutes?: string }>({});
  const [loading, setLoading] = useState(true);

  // Firestoreから勉強記録を取得
  useEffect(() => {
    const q = query(
      collection(db, "study-logs"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: StudyLog[] = snapshot.docs.map((d) => {
        const docData = d.data();
        return {
          id: d.id,
          subject: docData.subject ?? "",
          minutes: docData.minutes ?? 0,
          memo: docData.memo ?? "",
          createdAt: docData.createdAt,
        };
      });
      setLogs(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const totalMinutes = logs.reduce((sum, log) => sum + log.minutes, 0);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const newErrors: { subject?: string; minutes?: string } = {};
    if (!subject.trim()) {
      newErrors.subject = "科目を選択してください。";
    }
    const num = Number(minutes);
    if (!minutes.trim()) {
      newErrors.minutes = "時間を入力してください。";
    } else if (Number.isNaN(num) || num <= 0) {
      newErrors.minutes = "1以上の数字で入力してください。";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      await addDoc(collection(db, "study-logs"), {
        subject,
        minutes: num,
        memo: memo || "（メモなし）",
        createdAt: serverTimestamp(),
      });

      // フォームをリセット
      setMinutes("");
      setMemo("");
    } catch (error) {
      console.error("勉強記録の追加に失敗:", error);
      alert("記録の追加に失敗しました");
    }
  };

  return (
    <main className="fixed inset-0 bg-slate-900 text-white flex flex-col items-center overflow-hidden pt-16">
      <div className="w-full max-w-3xl px-3 md:px-4 py-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 4rem)' }}>

      <div className="w-full max-w-3xl">

        <div className="w-full max-w-2xl mb-6">
            <BackLink />
        </div>
        
        <h1 className="text-3xl font-bold">勉強記録</h1>
        <p className="mt-2 text-sm text-slate-300">
          科目・勉強時間・メモを入力してログを追加してみよう。
        </p>

        {/* 合計時間 */}
        <div className="mt-4 rounded-lg border border-slate-700 bg-slate-800 px-4 py-4 text-sm shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-400">記録数</span>
              <span className="ml-2 font-semibold text-blue-300">{logs.length} 件</span>
            </div>
            <div>
              <span className="text-slate-400">合計時間</span>
              <span className="ml-2 font-semibold text-blue-300">{totalMinutes} 分</span>
            </div>
          </div>
        </div>

        {/* 入力フォーム */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 bg-slate-800 p-6 rounded-lg border border-slate-700">

          {/* 科目 */}
          <div>
            <label className="block text-sm font-medium text-slate-200">
              科目 <span className="text-red-400">*</span>
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-700 px-3 py-2
                         text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
            >
              {SUBJECT_OPTIONS.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
            {errors.subject && (
              <p className="mt-1 text-xs text-red-400">{errors.subject}</p>
            )}
          </div>

          {/* 勉強時間 */}
          <div>
            <label className="block text-sm font-medium text-slate-200">
              勉強時間（分） <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min={1}
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-700 px-3 py-2
                         text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
              placeholder="例: 30"
            />
            {errors.minutes && (
              <p className="mt-1 text-xs text-red-400">{errors.minutes}</p>
            )}
          </div>

          {/* メモ */}
          <div>
            <label className="block text-sm font-medium text-slate-200">
              メモ（任意）
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-700 px-3 py-2
                         text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400 min-h-[80px]"
              placeholder="今日やった内容や感想など"
            />
          </div>

          <div className="flex justify-end pt-2">
            <PrimaryButton type="submit">記録を追加する</PrimaryButton>
          </div>
        </form>

        {/* ログ一覧 */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">記録一覧</h2>
          
          {loading ? (
            <div className="text-center text-slate-400 py-8">
              読み込み中...
            </div>
          ) : logs.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">
              まだ記録がありません。フォームから追加してみよう。
            </p>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => {
                const date = log.createdAt?.toDate?.();
                const timeStr = date
                  ? date.toLocaleTimeString("ja-JP", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "記録中";
                
                return (
                  <Card
                    key={log.id}
                    title={`${log.subject}：${log.minutes} 分`}
                    description={log.memo}
                    tag={timeStr}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
      </div>
    </main>
  );
}
