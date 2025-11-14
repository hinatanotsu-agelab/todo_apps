"use client";

import { useState, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { PrimaryButton } from "@/components/PrimaryButton";
import { BackLink } from "@/components/BackLink";


type Errors = {
  name?: string;
  email?: string;
  message?: string;
};

export default function ContactPage() {
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic") ?? "other";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(
    topic === "skills"
      ? "スキルアップについて相談したいです。"
      : topic === "nextjs"
      ? "Next.js の勉強方法について相談したいです。"
      : ""
  );
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (): Errors => {
    const newErrors: Errors = {};

    if (!name.trim()) {
      newErrors.name = "名前は必須です。";
    }

    if (!email.trim()) {
      newErrors.email = "メールアドレスは必須です。";
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      newErrors.email = "メールアドレスの形式が正しくありません。";
    }

    if (!message.trim()) {
      newErrors.message = "メッセージは必須です。";
    } else if (message.length < 10) {
      newErrors.message = "メッセージは10文字以上入力してください。";
    }

    return newErrors;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newErrors = validate();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitted(false);
      return;
    }

    setErrors({});
    setSubmitted(true);

    // 本来はここでAPIに送信したりする
    console.log("送信データ:", { name, email, message, topic });
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-xl">
        <div className="mb-4">
        {/* ひとつ前のページに戻る */}
        <BackLink />

        {/* もしくは常に Home に戻したいなら */}
        {/* <BackLink href="/" /> */}
        </div>
        <h1 className="text-3xl font-bold">お問い合わせ</h1>
        <p className="mt-2 text-slate-300 text-sm">
          Next.js や学習についての相談フォームです。
          <br />
          URL のクエリパラメータ <code>?topic=nextjs</code> などで
          メッセージの初期値が変わります。
        </p>

        {/* topic の表示 */}
        <p className="mt-3 text-xs text-slate-400">
          現在の topic: <code>{topic}</code>
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* 名前 */}
          <div>
            <label className="block text-sm font-medium text-slate-200">
              名前 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="例: 田中 太郎"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-400">{errors.name}</p>
            )}
          </div>

          {/* メール */}
          <div>
            <label className="block text-sm font-medium text-slate-200">
              メールアドレス <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="example@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-400">{errors.email}</p>
            )}
          </div>

          {/* メッセージ */}
          <div>
            <label className="block text-sm font-medium text-slate-200">
              メッセージ <span className="text-red-400">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm outline-none focus:border-blue-500 min-h-[120px]"
              placeholder="ご相談内容を入力してください。"
            />
            <div className="mt-1 flex justify-between text-xs">
              <span className={errors.message ? "text-red-400" : "text-slate-400"}>
                {errors.message ?? "10文字以上で入力してください。"}
              </span>
              <span className="text-slate-500">{message.length} 文字</span>
            </div>
          </div>

          <div className="flex justify-end pt-8">
            <PrimaryButton type="submit">送信する</PrimaryButton>
          </div>

          {submitted && (
            <p className="mt-2 text-sm text-emerald-400">
              フォームを送信したつもりになりました！（実際にはまだどこにも送っていません）
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
