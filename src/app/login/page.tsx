"use client";

import { useState, FormEvent } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/"); // ログイン成功後、ホームページへ
    } catch (err: any) {
      console.error(err);
      // Firebase エラーメッセージの日本語化
      switch (err.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
          setError("メールアドレスまたはパスワードが正しくありません");
          break;
        case "auth/invalid-credential":
          setError("ログイン情報が正しくありません。メールアドレスとパスワードを確認してください");
          break;
        case "auth/invalid-email":
          setError("メールアドレスの形式が正しくありません");
          break;
        case "auth/user-disabled":
          setError("このアカウントは無効化されています");
          break;
        case "auth/operation-not-allowed":
          setError("メール/パスワード認証が有効になっていません。管理者に連絡してください");
          break;
        default:
          setError(`ログインに失敗しました: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-lg shadow-xl p-8">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">
            ログイン
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="パスワードを入力"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? "ログイン中..." : "ログイン"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              アカウントをお持ちでない方は{" "}
              <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-medium">
                新規登録
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
