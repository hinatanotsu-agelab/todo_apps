"use client";

import { useState, FormEvent } from "react";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { BackLink } from "@/components/BackLink";

type StudyLog = {
  id: number;
  subject: string;
  minutes: number;
  memo: string;
  createdAt: string;
};

const SUBJECT_OPTIONS = ["数学", "英語", "情報", "物理", "その他"];

export default function StudyPage() {
  const [subject, setSubject] = useState("英語");
  const [minutes, setMinutes] = useState("");
  const [memo, setMemo] = useState("");
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [errors, setErrors] = useState<{ subject?: string; minutes?: string }>({});

  const totalMinutes = logs.reduce((sum, log) => sum + log.minutes, 0);

  const handleSubmit = (e: FormEvent) => {
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
    const newLog: StudyLog = {
      id: Date.now(),
      subject,
      minutes: num,
      memo: memo || "（メモなし）",
      createdAt: new Date().toISOString(),
    };

    setLogs((prev) => [newLog, ...prev]);
    setMinutes("");
    setMemo("");
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center py-12 px-4">

      <div className="w-full max-w-3xl">

        <div className="w-full max-w-2xl mb-6">
            <BackLink />
        </div>
        
        <h1 className="text-3xl font-bold">勉強記録</h1>
        <p className="mt-2 text-sm text-slate-300">
          科目・勉強時間・メモを入力してログを追加してみよう。
        </p>

        {/* 合計時間 */}
        <div className="mt-4 rounded-lg border border-slate-700 bg-slate-800 px-4 py-4 text-sm shadow-sm flex justify-between">
          <span className="text-slate-300">今日の合計勉強時間</span>
          <span className="font-semibold text-blue-300">
            {totalMinutes} 分
          </span>
        </div>

        {/* 入力フォーム */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">

          {/* 科目 */}
          <div>
            <label className="block text-sm font-medium text-slate-200">
              科目 <span className="text-red-400">*</span>
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2
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
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2
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
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2
                         text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400 min-h-[80px]"
              placeholder="今日やった内容や感想など"
            />
          </div>

          <div className="flex justify-end pt-2">
            <PrimaryButton type="submit">記録を追加する</PrimaryButton>
          </div>
        </form>

        {/* ログ一覧 */}
        <div className="mt-8 space-y-3">
          {logs.length === 0 ? (
            <p className="text-sm text-slate-400">
              まだ記録がありません。フォームから追加してみよう。
            </p>
          ) : (
            logs.map((log) => (
              <Card
                key={log.id}
                title={`${log.subject}：${log.minutes} 分`}
                description={log.memo}
                tag={new Date(log.createdAt).toLocaleTimeString("ja-JP", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
