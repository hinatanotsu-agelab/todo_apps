"use client";

import { useState, FormEvent, useEffect, useMemo } from "react";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { BackLink } from "@/components/BackLink";
import { StudyEditor, type StudyLogForEdit } from "@/components/StudyEditor";
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
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

type StudyLog = {
  id: string;
  subject: string;
  minutes: number;
  memo: string;
  createdAt: any;
  userRef?: string;
};

const SUBJECT_OPTIONS = ["数学", "英語", "情報", "物理", "化学","社会福祉学", "その他"];

export default function StudyPage() {
  const [subject, setSubject] = useState("英語");
  const [minutes, setMinutes] = useState("");
  const [memo, setMemo] = useState("");
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [errors, setErrors] = useState<{ subject?: string; minutes?: string }>({});
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<StudyLogForEdit | null>(null);
  const [editingSrc, setEditingSrc] = useState<StudyLog | null>(null);
  const [editingDate, setEditingDate] = useState<string>("");
  const { user } = useAuth();

  // Firestoreから勉強記録を取得
  useEffect(() => {
    if (!user) {
      setLogs([]);
      setLoading(false);
      return;
    }

    const nextHandler = (snapshot: any, sortInMemory = false) => {
      const data: StudyLog[] = snapshot.docs.map((d: any) => {
        const docData = d.data();
        return {
          id: d.id,
          subject: docData.subject ?? "",
          minutes: docData.minutes ?? 0,
          memo: docData.memo ?? "",
          createdAt: docData.createdAt,
          userRef: docData.userRef,
        };
      });
      if (sortInMemory) {
        data.sort((a, b) => {
          const ta = a.createdAt?.toMillis?.() ?? a.createdAt?.toDate?.()?.getTime?.() ?? 0;
          const tb = b.createdAt?.toMillis?.() ?? b.createdAt?.toDate?.()?.getTime?.() ?? 0;
          return tb - ta; // desc
        });
      }
      setLogs(data);
      setLoading(false);
    };

    let unsubscribe: () => void = () => {};

    try {
      const qOrdered = query(
        collection(db, "study-logs"),
        where("userRef", "==", user.uid),
        orderBy("createdAt", "desc")
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
            console.error("study-logs onSnapshot error:", err);
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

  const totalMinutes = logs.reduce((sum, log) => sum + log.minutes, 0);

  // 日付別グルーピング（最新日付が上）
  const groupedLogs = useMemo(() => {
    const map = new Map<string, { label: string; sortKey: string; items: StudyLog[] }>();
    const toYMD = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };
    logs.forEach((log) => {
      const d = log.createdAt?.toDate?.();
      const sortKey = d ? toYMD(d) : "0000-00-00";
      const label = d ? `${d.getMonth() + 1}月${d.getDate()}日` : "記録中";
      if (!map.has(sortKey)) map.set(sortKey, { label, sortKey, items: [] });
      map.get(sortKey)!.items.push(log);
    });
    return Array.from(map.values()).sort((a, b) => b.sortKey.localeCompare(a.sortKey));
  }, [logs]);

  const handleDelete = async (id: string) => {
    if (!confirm("この学習記録を削除しますか？")) return;
    try {
      await deleteDoc(doc(db, "study-logs", id));
    } catch (e) {
      console.error("削除に失敗:", e);
      alert("削除に失敗しました");
    }
  };

  const handleEdit = (log: StudyLog) => {
    const d = log.createdAt?.toDate?.();
    const toYMD = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };
    setEditing({ id: log.id, subject: log.subject, minutes: log.minutes, memo: log.memo });
    setEditingDate(d ? toYMD(d) : "");
    setEditingSrc(log);
    setEditorOpen(true);
  };

  const handleSave = async (updated: StudyLogForEdit) => {
    try {
      const patch: any = {
        subject: updated.subject,
        minutes: Number(updated.minutes),
        memo: updated.memo,
      };
      if (updated.newDate && editingSrc?.createdAt?.toDate) {
        const orig = editingSrc.createdAt.toDate();
        const [y, m, d] = updated.newDate.split("-").map((v) => Number(v));
        const newDate = new Date(y, (m || 1) - 1, d || 1, orig.getHours(), orig.getMinutes(), orig.getSeconds(), 0);
        patch.createdAt = Timestamp.fromDate(newDate);
      }
      await updateDoc(doc(db, "study-logs", updated.id), patch);
      setEditorOpen(false);
      setEditing(null);
      setEditingSrc(null);
    } catch (e) {
      console.error("更新に失敗:", e);
      alert("更新に失敗しました");
    }
  };

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
      if (!user) return;
      await addDoc(collection(db, "study-logs"), {
        subject,
        minutes: num,
        memo: memo || "（メモなし）",
        userRef: user.uid,
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
    <main className="text-white flex flex-col items-center py-4 md:py-8">
      <div className="w-full max-w-3xl px-3 md:px-4 py-6">

      <div className="w-full max-w-3xl">
        
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
            <div className="space-y-6">
              {groupedLogs.map((group) => (
                <div key={group.sortKey}>
                  <h3 className="text-base font-semibold text-slate-200 mb-3">{group.label}</h3>
                  <div className="space-y-3">
                    {group.items.map((log) => {
                      const date = log.createdAt?.toDate?.();
                      const timeStr = date
                        ? date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })
                        : "記録中";
                      return (
                        <Card
                          key={log.id}
                          title={`${log.subject}：${log.minutes} 分`}
                          description={log.memo}
                          tag={timeStr}
                        >
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleEdit(log)}
                              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              編集
                            </button>
                            <button
                              onClick={() => handleDelete(log.id)}
                              className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              削除
                            </button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* 編集モーダル */}
      <StudyEditor
        open={editorOpen}
        log={editing}
        onSave={handleSave}
        onClose={() => {
          setEditorOpen(false);
          setEditing(null);
          setEditingSrc(null);
        }}
        initialDate={editingDate}
      />
      </div>
    </main>
  );
}
