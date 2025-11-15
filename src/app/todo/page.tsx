"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { KeyboardEvent } from "react";
import Link from "next/link";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { TodoEditor } from "@/components/TodoEditor";
import { useAuth } from "@/contexts/AuthContext";

type Todo = {
  id: string;
  text: string;
  done: boolean;
  date?: string;
  startTime?: string;
  endTime?: string;
  memo?: string;
  createdAt?: any;
  userRef?: string;
};

export default function TodoPage() {
  const [input, setInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [startTimeInput, setStartTimeInput] = useState("");
  const [endTimeInput, setEndTimeInput] = useState("");
  const [memoInput, setMemoInput] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const { user } = useAuth();

  // 🔹 Firestoreから一覧をリアルタイム購読
  useEffect(() => {
    if (!user) {
      setTodos([]);
      return;
    }

    const nextHandler = (snapshot: any, sortInMemory = false) => {
      const data: Todo[] = snapshot.docs.map((d: any) => {
        const docData = d.data();
        return {
          id: d.id,
          text: docData.text ?? "",
          done: docData.done ?? false,
          date: docData.date,
          startTime: docData.startTime,
          endTime: docData.endTime,
          memo: docData.memo,
          createdAt: docData.createdAt,
          userRef: docData.userRef,
        };
      });
      if (sortInMemory) {
        data.sort((a, b) => {
          const ta = a.createdAt?.toMillis?.() ?? a.createdAt?.toDate?.()?.getTime?.() ?? 0;
          const tb = b.createdAt?.toMillis?.() ?? b.createdAt?.toDate?.()?.getTime?.() ?? 0;
          return tb - ta;
        });
      }
      setTodos(data);
    };

    let unsubscribe: () => void = () => {};

    // まずは createdAt 並びで購読（要コンポジットインデックス）
    try {
      const qOrdered = query(
        collection(db, "todos"),
        where("userRef", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      unsubscribe = onSnapshot(
        qOrdered,
        (snap) => nextHandler(snap, false),
        (err) => {
          // インデックス未作成などのときはフォールバック
          if ((err as any)?.code === "failed-precondition") {
            const qFallback = query(
              collection(db, "todos"),
              where("userRef", "==", user.uid)
            );
            unsubscribe = onSnapshot(qFallback, (snap) => nextHandler(snap, true));
          } else {
            console.error("todos onSnapshot error:", err);
          }
        }
      );
    } catch (e) {
      console.error(e);
    }

    return () => unsubscribe?.();
  }, [user]);

  // 🔹 追加（Firestoreにだけ書き込み → onSnapshotでstateに反映）
  const handleAdd = async () => {
    if (!input.trim()) return;

    const text = input.trim();
    // 簡易バリデーション（開始 < 終了）
    if (startTimeInput && endTimeInput && startTimeInput >= endTimeInput) {
      alert("開始時刻は終了時刻より前にしてください。");
      return;
    }

    try {
      if (!user) return;
      await addDoc(collection(db, "todos"), {
        text,
        done: false,
        date: dateInput || null,
        startTime: startTimeInput || null,
        endTime: endTimeInput || null,
        memo: memoInput || null,
        userRef: user.uid,
        createdAt: serverTimestamp(),
      });
      console.log("Firestore に追加できたよ");
      // 入力リセット
      setInput("");
      setDateInput("");
      setStartTimeInput("");
      setEndTimeInput("");
      setMemoInput("");
    } catch (error) {
      console.error("Firestore への追加に失敗:", error);
    }
  };

  // 🔹 完了状態の切り替え（ローカル更新＋Firestore更新）
  const toggleDone = async (todo: Todo) => {
    const newDone = !todo.done;

    // 体感を軽くするため先にローカルを更新
    setTodos((prev) =>
      prev.map((t) =>
        t.id === todo.id ? { ...t, done: newDone } : t
      )
    );

    try {
      await updateDoc(doc(db, "todos", todo.id), {
        done: newDone,
      });
    } catch (error) {
      console.error("完了状態の更新に失敗:", error);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAdd();
    }
  };

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setEditorOpen(true);
  };

  const handleSave = async (updated: Todo) => {
    try {
      await updateDoc(doc(db, "todos", updated.id), {
        text: updated.text,
        date: updated.date || null,
        startTime: updated.startTime || null,
        endTime: updated.endTime || null,
        memo: updated.memo || null,
      });
      setEditorOpen(false);
      setEditingTodo(null);
    } catch (error) {
      console.error("更新に失敗:", error);
    }
  };

  const handleDelete = async (todoId: string) => {
    if (!confirm("本当に削除しますか？")) return;
    
    try {
      await deleteDoc(doc(db, "todos", todoId));
    } catch (error) {
      console.error("削除に失敗:", error);
    }
  };

  // 🔹 日付ごとにグルーピング
  const grouped = useMemo(() => {
    const map = new Map<string, Todo[]>();
    todos.forEach((t) => {
      const key = t.date || "未設定";
      const arr = map.get(key) || [];
      arr.push(t);
      map.set(key, arr);
    });
    const keys = Array.from(map.keys());
    keys.sort((a, b) => {
      if (a === "未設定") return 1;
      if (b === "未設定") return -1;
      // 日付降順（YYYY-MM-DD前提）
      return a < b ? 1 : a > b ? -1 : 0;
    });
    return keys.map((k) => {
      const items = (map.get(k) || []).slice();
      items.sort((a, b) => {
        const sa = a.startTime || "";
        const sb = b.startTime || "";
        if (sa && sb) return sa.localeCompare(sb);
        if (sa) return -1;
        if (sb) return 1;
        // startTimeが両方ない場合は作成日時降順
        const ta = a.createdAt?.toMillis?.() ?? a.createdAt?.toDate?.()?.getTime?.() ?? 0;
        const tb = b.createdAt?.toMillis?.() ?? b.createdAt?.toDate?.()?.getTime?.() ?? 0;
        return tb - ta;
      });
      return { dateKey: k, items };
    });
  }, [todos]);

  return (
    <main className="flex items-center justify-center py-4 md:py-8">
      <div className="w-full max-w-3xl bg-slate-800 shadow-lg rounded-lg p-4 md:p-6 mx-2 my-4">
        <div className="flex items-center justify-start mb-4">
          <h1 className="text-white text-2xl font-bold">My Todo</h1>
        </div>

        {/* 入力（作成時にも日付・時間・メモを設定可能） */}
        <div className="space-y-3 mb-6">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="やることを入力..."
              className="flex-1 text-white bg-slate-700 placeholder:text-slate-400 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAdd}
              className="px-4 py-2 rounded bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 disabled:bg-slate-600"
              disabled={!input.trim()}
            >
              追加
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="text-white bg-slate-700 placeholder:text-slate-400 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <input
                type="time"
                value={startTimeInput}
                onChange={(e) => setStartTimeInput(e.target.value)}
                className="flex-1 text-white bg-slate-700 placeholder:text-slate-400 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="self-center text-xs text-slate-400">〜</span>
              <input
                type="time"
                value={endTimeInput}
                onChange={(e) => setEndTimeInput(e.target.value)}
                className="flex-1 text-white bg-slate-700 placeholder:text-slate-400 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <textarea
            value={memoInput}
            onChange={(e) => setMemoInput(e.target.value)}
            placeholder="メモ（任意）"
            className="w-full text-white bg-slate-700 placeholder:text-slate-400 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
        </div>

        {/* Firestoreから取ってきた一覧（⽇付ごと） */}
        <div className="space-y-6">
          {grouped.map(({ dateKey, items }) => (
            <div key={dateKey}>
              <div className="text-slate-300 text-sm font-semibold mb-2 flex items-center gap-2">
                <span className="text-slate-400">📅</span>
                <span>{dateKey}</span>
              </div>
              <div className="space-y-3">
                {items.map((todo) => (
                  <div
                    key={todo.id}
                    className="bg-slate-700 border border-slate-600 rounded-lg p-4 hover:bg-slate-600 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <input
                            type="checkbox"
                            checked={todo.done}
                            onChange={() => toggleDone(todo)}
                            className="w-5 h-5 cursor-pointer"
                          />
                          <span
                            className={`text-lg font-medium ${
                              todo.done ? "line-through text-slate-400" : "text-white"
                            }`}
                          >
                            {todo.text}
                          </span>
                        </div>

                        {/* 詳細情報（この⽇に含まれる時間帯） */}
                        {(todo.startTime || todo.endTime || todo.memo) && (
                          <div className="ml-8 space-y-1 text-sm text-slate-300">
                            {(todo.startTime || todo.endTime) && (
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400">⏰</span>
                                <span>
                                  {todo.startTime || "未設定"} 〜 {todo.endTime || "未設定"}
                                </span>
                              </div>
                            )}
                            {todo.memo && (
                              <div className="flex items-start gap-2">
                                <span className="text-slate-400">📝</span>
                                <span className="flex-1">{todo.memo}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* アクションボタン */}
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(todo)}
                          className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(todo.id)}
                          className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {items.length === 0 && (
                  <div className="text-sm text-slate-400 text-center py-4">この日のタスクはありません</div>
                )}
              </div>
            </div>
          ))}

          {grouped.length === 0 && (
            <div className="text-sm text-slate-400 text-center py-8">まだタスクがありません</div>
          )}
        </div>
      </div>

      {/* 編集モーダル */}
      <TodoEditor
        open={editorOpen}
        todo={editingTodo}
        onSave={handleSave}
        onClose={() => {
          setEditorOpen(false);
          setEditingTodo(null);
        }}
      />
    </main>
  );
}
