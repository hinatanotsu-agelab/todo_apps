"use client";

import React, { useEffect, useState } from "react";

export type StudyLogForEdit = {
  id: string;
  subject: string;
  minutes: number;
  memo: string;
  newDate?: string; // YYYY-MM-DD
};

type StudyEditorProps = {
  open: boolean;
  log: StudyLogForEdit | null;
  onSave: (updated: StudyLogForEdit) => void;
  onClose: () => void;
  initialDate: string; // YYYY-MM-DD
};

const SUBJECT_OPTIONS = ["数学", "英語", "情報", "物理", "化学", "社会福祉学", "その他"];

export function StudyEditor({ open, log, onSave, onClose, initialDate }: StudyEditorProps) {
  const [subject, setSubject] = useState("");
  const [minutes, setMinutes] = useState<string>("");
  const [memo, setMemo] = useState("");
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    if (!log) return;
    setSubject(log.subject || "その他");
    setMinutes(String(log.minutes ?? ""));
    setMemo(log.memo || "");
    setDate(initialDate || "");
  }, [log, initialDate]);

  if (!open || !log) return null;

  const handleSave = () => {
    const m = Number(minutes);
    if (!subject.trim() || Number.isNaN(m) || m <= 0) return;
    onSave({ ...log, subject, minutes: m, memo, newDate: date });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-4">
        <h2 className="text-lg font-semibold mb-3 text-black">学習記録を編集</h2>

        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">学習日付</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">科目</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SUBJECT_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">勉強時間（分）</label>
            <input
              type="number"
              min={1}
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: 30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">メモ</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
              placeholder="内容や感想など"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-sm rounded bg-blue-500 text-white font-semibold hover:bg-blue-600"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
