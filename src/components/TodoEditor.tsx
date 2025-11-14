"use client";

import React, { useEffect, useState } from "react";

export type Todo = {
  id: number;
  text: string;
  done: boolean;
  date?: string;
  startTime?: string;
  endTime?: string;
  memo?: string;
};

type TodoEditorProps = {
  open: boolean;
  todo: Todo | null;
  onSave: (updated: Todo) => void;
  onClose: () => void;
};

export function TodoEditor({ open, todo, onSave, onClose }: TodoEditorProps) {
  const [text, setText] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [memo, setMemo] = useState("");


  // 編集対象が変わったらフォームに反映
  useEffect(() => {
    if (!todo) return;
    setText(todo.text);
    setDate(todo.date ?? "");
    setStartTime(todo.startTime ?? "");
    setEndTime(todo.endTime ?? "");
    setMemo(todo.memo ?? "");
  }, [todo]);

  if (!open || !todo) return null; // 閉じているときは何も描画しない

  const handleSave = () => {
    if (!text.trim()) return;
    onSave({
      ...todo,
      text: text.trim(),
      date: date || undefined,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      memo: memo || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-4">
        <h2 className="text-lg font-semibold mb-3 text-black">タスクを編集</h2>

        <div className="space-y-2 mb-4">
          {/* タスク名 */}
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="タスク名"
            className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* 日付 */}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* 開始 / 終了時間 */}
          <div className="flex gap-2">
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="flex-1 text-black border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="self-center text-xs text-gray-500">〜</span>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="flex-1 text-black border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* メモ */}
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="メモ（任意）"
            className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
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
            className="px-4 py-1.5 text-sm rounded bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:bg-gray-300"
            disabled={!text.trim()}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
