# S-PRIME ERP — 半導体精密機器 統合管理システム

> Semiconductor Precision Resource & Inventory Management ERP

React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui で構築された ERP フロントエンドプロトタイプです。

## クイックスタート

```bash
npm install
npm run dev        # → http://localhost:8080
npm run build      # → dist/
npm test           # vitest
```

## 主な機能

- **ダッシュボード** — KPI、チャート、在庫現況
- **生産伝票** — 作成・承認フロー・実行管理
- **出庫伝票** — 出庫・配送・在庫調整
- **BOM生産** — 自材明細ベースの自動展開
- **財務諸表** — B/S・P/L 照会 + PDF出力
- **請求書/発注書** — PDF プレビュー・一括印刷
- **マスタ管理** — 社員・品目・倉庫 CRUD

## 技術スタック

| 技術 | 用途 |
|------|------|
| React 18 + TypeScript | UI フレームワーク |
| Vite | ビルドツール |
| Tailwind CSS + shadcn/ui | スタイリング + UI コンポーネント |
| TanStack React Query | API データ管理 |
| Zod + react-hook-form | フォームバリデーション |
| Recharts | ダッシュボードチャート |
| @react-pdf/renderer | ブラウザ側 PDF 生成 |

## ドキュメント

| ファイル | 対象 | 内容 |
|----------|------|------|
| `HANDOVER.md` | 開発者 | プロジェクト構造・全機能の詳細説明 (韓国語) |
| `REACT_EDUCATION.md` | React 初心者 | React 基礎からプロジェクトパターンまで (韓国語) |
| `LLM_CONTEXT.md` | AI エージェント | コードベース全体のコンテキスト (英語) |
| `S-PRIME_ERP_企画書.md` | 企画 | 技術企画書 (日本語) |
| `S-PRIME_ERP_기획서.md` | 기획 | 技術企画書 (韓国語) |

## バックエンド連携

C# .NET Core バックエンド連携に対応した設計済み:

- `src/services/` — API クライアント + ドメインサービス
- `src/types/` — C# DTO とマッピングされた型定義
- `src/hooks/api/` — React Query データフェッチングフック

```bash
# .env.local
VITE_API_BASE_URL=http://localhost:5000/api
VITE_USE_MOCK_DATA=true   # false で実 API に切替
```

## ライセンス

Private — S-Prime Corp.
