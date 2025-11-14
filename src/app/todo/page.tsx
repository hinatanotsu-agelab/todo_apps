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
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type Todo = {
  id: string;      // Firestore の doc.id
  text: string;
  done: boolean;
  createdAt?: any; // 型細かくやるなら Timestamp
};

export default function TodoPage() {
  const [input, setInput] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);

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
    // TODO: 編集モーダルを開く or 画面遷移するなど
    console.log("編集するタスク:", todo);
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-black text-2xl font-bold">My Todo</h1>
          <Link
            href="/"
            className="text-xs text-blue-500 hover:underline"
          >
            ホームに戻る
          </Link>
        </div>

        {/* 入力 */}
        <div className="flex gap-2 mb-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="やることを入力..."
            className="flex-1 text-black placeholder:text-gray-500 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAdd}
            className="px-4 py-2 rounded bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 disabled:bg-gray-300"
            disabled={!input.trim()}
          >
            追加
          </button>
        </div>

        {/* Firestoreから取ってきた一覧 */}
        <ul className="space-y-2">
          {todos.map((todo) => (
<li
  key={todo.id}
  className="flex items-center justify-between text-gray-800 bg-gray-50 border border-gray-200 rounded px-3 py-2"
>
  {/* 左側：タスク名（クリックで完了トグル） */}
  <span
    onClick={() => toggleDone(todo)}
    className={`flex-1 text-sm cursor-pointer ${
      todo.done ? "line-through text-gray-400" : ""
    }`}
  >
    {todo.text}
  </span>

  {/* 右側：編集ボタン */}
  <button
    onClick={() => handleEdit(todo)}
    className="ml-2 text-xs text-blue-500 hover:underline"
  >
    編集
  </button>
</li>

          ))}

          {todos.length === 0 && (
            <li className="text-xs text-gray-400 text-center">
              まだタスクがありません
            </li>
          )}
        </ul>
      </div>
    </main>
  );
}
