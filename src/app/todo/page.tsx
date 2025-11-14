"use client";

import React, { useEffect, useState } from "react";
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
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { TodoEditor } from "@/components/TodoEditor";

type Todo = {
  id: string;
  text: string;
  done: boolean;
  date?: string;
  startTime?: string;
  endTime?: string;
  memo?: string;
  createdAt?: any;
};

export default function TodoPage() {
  const [input, setInput] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  // 🔹 Firestoreから一覧をリアルタイム購読
  useEffect(() => {
    const q = query(
      collection(db, "todos"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Todo[] = snapshot.docs.map((d) => {
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
        };
      });
      setTodos(data);
    });

    return () => unsubscribe();
  }, []);

  // 🔹 追加（Firestoreにだけ書き込み → onSnapshotでstateに反映）
  const handleAdd = async () => {
    if (!input.trim()) return;

    const text = input.trim();
    setInput("");

    try {
      await addDoc(collection(db, "todos"), {
        text,
        done: false,
        createdAt: serverTimestamp(),
      });
      console.log("Firestore に追加できたよ");
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

  return (
    <main className="fixed inset-0 bg-slate-900 flex items-center justify-center overflow-hidden pt-16">
      <div className="w-full max-w-3xl bg-slate-800 shadow-lg rounded-lg p-4 md:p-6 mx-2 my-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 5rem)' }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-white text-2xl font-bold">My Todo</h1>
          <Link
            href="/"
            className="text-xs text-blue-400 hover:underline"
          >
            ホームに戻る
          </Link>
        </div>

        {/* 入力 */}
        <div className="flex gap-2 mb-6">
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

        {/* Firestoreから取ってきた一覧 */}
        <div className="space-y-3">
          {todos.map((todo) => (
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

                  {/* 詳細情報 */}
                  {(todo.date || todo.startTime || todo.endTime || todo.memo) && (
                    <div className="ml-8 space-y-1 text-sm text-slate-300">
                      {todo.date && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">📅</span>
                          <span>{todo.date}</span>
                        </div>
                      )}
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

          {todos.length === 0 && (
            <div className="text-sm text-slate-400 text-center py-8">
              まだタスクがありません
            </div>
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
