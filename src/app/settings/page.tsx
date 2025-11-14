"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { deleteUser, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("ログアウトエラー:", error);
    }
  };

  const handlePasswordChange = async () => {
    setError("");
    setSuccess("");

    if (!newPassword || !confirmPassword || !currentPassword) {
      setError("すべての項目を入力してください");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("新しいパスワードが一致しません");
      return;
    }

    if (newPassword.length < 6) {
      setError("パスワードは6文字以上で入力してください");
      return;
    }

    setLoading(true);

    try {
      if (!user || !user.email) {
        setError("ユーザー情報が取得できません");
        return;
      }

      // 再認証
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // パスワード更新
      await updatePassword(user, newPassword);
      
      setSuccess("パスワードを変更しました");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordChange(false);
    } catch (err: any) {
      console.error("パスワード変更エラー:", err);
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("現在のパスワードが正しくありません");
      } else {
        setError("パスワード変更に失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      await deleteUser(user);
      router.push("/signup");
    } catch (err: any) {
      console.error("アカウント削除エラー:", err);
      if (err.code === "auth/requires-recent-login") {
        setError("セキュリティのため、再ログインしてから削除してください");
      } else {
        setError("アカウント削除に失敗しました");
      }
      setShowDeleteConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="fixed inset-0 bg-slate-900 flex items-center justify-center overflow-hidden pt-16">
      <div className="w-full max-w-2xl bg-slate-800/80 shadow-lg rounded-lg p-4 md:p-6 mx-2 my-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 5rem)' }}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-white">
            設定
          </h1>
          <Link
            href="/"
            className="text-xs md:text-sm text-blue-400 hover:underline"
          >
            ホームに戻る
          </Link>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded text-sm">
            {success}
          </div>
        )}

        <div className="space-y-4">
          {/* アカウント情報 */}
          <div className="border border-slate-700 rounded-lg p-4">
            <h2 className="text-base md:text-lg font-semibold text-white mb-3">
              アカウント情報
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">メールアドレス</span>
                <span className="text-white truncate ml-2 max-w-[200px]">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">ユーザーID</span>
                <span className="text-slate-500 text-xs truncate ml-2 max-w-[200px]">{user?.uid}</span>
              </div>
            </div>
          </div>

          {/* パスワード変更 */}
          <div className="border border-slate-700 rounded-lg p-4">
            <h2 className="text-base md:text-lg font-semibold text-white mb-3">
              パスワード変更
            </h2>
            {!showPasswordChange ? (
              <button
                onClick={() => setShowPasswordChange(true)}
                className="w-full md:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
              >
                パスワードを変更
              </button>
            ) : (
              <div className="space-y-3">
                <input
                  type="password"
                  placeholder="現在のパスワード"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="password"
                  placeholder="新しいパスワード"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="password"
                  placeholder="新しいパスワード（確認）"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handlePasswordChange}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white text-sm rounded-lg transition-colors"
                  >
                    {loading ? "変更中..." : "変更"}
                  </button>
                  <button
                    onClick={() => {
                      setShowPasswordChange(false);
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setError("");
                    }}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ログアウト */}
          <div className="border border-slate-700 rounded-lg p-4">
            <h2 className="text-base md:text-lg font-semibold text-white mb-3">
              ログアウト
            </h2>
            <p className="text-xs md:text-sm text-slate-300 mb-3">
              アカウントからログアウトします。
            </p>
            <button
              onClick={handleLogout}
              className="w-full md:w-auto px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
            >
              ログアウトする
            </button>
          </div>

          {/* アカウント削除 */}
          <div className="border border-red-900/50 rounded-lg p-4 bg-red-950/20">
            <h2 className="text-base md:text-lg font-semibold text-red-400 mb-3">
              危険な操作
            </h2>
            <p className="text-xs md:text-sm text-slate-300 mb-3">
              アカウントを削除すると、すべてのデータが完全に削除され、復元できません。
            </p>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full md:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
              >
                アカウントを削除
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-red-400 font-semibold">
                  本当に削除しますか？この操作は取り消せません。
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white text-sm rounded-lg transition-colors"
                  >
                    {loading ? "削除中..." : "削除を実行"}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
