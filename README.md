## 学習ハブ (Next.js + Tailwind CSS + TypeScript)

学習カード・レッスン閲覧・勉強記録・お問い合わせフォームを備えた学習支援用ミニアプリです。

### 主な機能

- ホーム: カード検索 (タイトル/説明/タグフィルタ) / レッスン遷移
- レッスン: 個別ページ + 関連レッスンの推奨リンク表示
- 勉強記録: ログ追加 (科目・分数・メモ) / localStorage 永続化 / 科目別累計バー表示
- お問い合わせ: クエリ `?topic=` によるメッセージ初期化 / バリデーション / 件名追加 / プリセット挿入ボタン
- テーマ切替: ダーク/ライトモード (localStorage 永続化)
- API ルート: `/api/study-logs` (GET/POST の簡易メモリ実装例)
- エラーハンドリング: `error.tsx`, `not-found.tsx` のカスタム UI
- SEO: `metadata` 追加 / `sitemap.ts` 自動生成 (静的パス)

### 開発環境起動

```bash
npm install
npm run dev
```

`http://localhost:3000` を開きます。

### ディレクトリ構成 (抜粋)

```
src/app/
	page.tsx              # ホーム (検索機能付き)
	study/page.tsx        # 勉強記録 (localStorage + 集計)
	lessons/[slug]/page.tsx  # レッスン詳細 + 推奨リンク
	contact/page.tsx      # お問い合わせフォーム
	api/study-logs/route.ts  # API ルート (GET/POST)
	sitemap.ts            # サイトマップ
	error.tsx / not-found.tsx
src/components/
	ThemeToggle.tsx
	BackLink.tsx
	Card.tsx / PrimaryButton.tsx
```

### API 例

```bash
curl http://localhost:3000/api/study-logs
curl -X POST http://localhost:3000/api/study-logs -H 'Content-Type: application/json' \
	-d '{"subject":"数学","minutes":45,"memo":"図形問題"}'
```

### 次の拡張アイデア

- 勉強ログを日付別にグラフ化 (ライブラリ導入)
- 認証追加してユーザー別ログ管理
- Markdown ベースのレッスンコンテンツ動的読み込み
- メール送信 (外部 API 利用)

---
Create Next App 由来の初期説明は省略しました。詳細は公式ドキュメントをご覧ください。
# todo-dashboard
# todo_apps
# todo_apps
# todo_apps
