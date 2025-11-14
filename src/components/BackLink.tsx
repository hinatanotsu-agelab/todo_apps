"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type BackLinkProps = {
  /** 戻り先を固定したいときだけ指定（例: "/"） */
  href?: string;
  /** 文言を変えたいとき用（デフォルト: "戻る"） */
  label?: string;
};

export function BackLink({ href, label = "戻る" }: BackLinkProps) {
  const router = useRouter();

  const inner = (
    <span className="inline-flex items-center gap-1 text-sm text-slate-300 hover:text-white cursor-pointer">
      <span className="text-lg leading-none">&lt;</span>
      <span>{label}</span>
    </span>
  );

  // href がある場合はそのパスへ遷移（Link）
  if (href) {
    return <Link href={href}>{inner}</Link>;
  }

  // href がない場合は「ひとつ前のページ」に戻る（履歴戻る）
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="bg-transparent border-none p-0"
    >
      {inner}
    </button>
  );
}
