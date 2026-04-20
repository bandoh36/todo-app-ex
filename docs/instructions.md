# MyTODO — 開発・運用インストラクション（AI 支援向け）

本文は人間・エージェント共通の「このリポジトリでの守ること」です。推測で書かない項目は `architecture.md` とコードを確認してください。

## 技術前提

- **Node**: Volta 指定 `24.13.0`（`package.json` の `volta`）
- **パッケージマネージャ**: npm
- **言語**: TypeScript（React レンダラー / Electron メインプロセス分離）

## 必須コマンド

| 目的 | コマンド |
|------|----------|
| 開発（Vite + Electron） | `npm run dev` |
| 型チェック + 本番ビルド | `npm run build` |
| ビルド後のローカル起動 | `npm run build` のあと `npm run start` |

変更をまとめる前に **`npm run build` が通ること** を確認する。

## データとプライバシー

- ユーザーデータは **`./data/data.json`**（`.gitignore` 対象）
- 本番 IPC 経路で永続化。スキーマ変更時は **`electron/store.ts`** の型と既存 JSON の後方互換を意識する
- テスト用データをリポジトリにコミットしない

## UI / UX 上の禁止・推奨

- **ネイティブ `confirm()` / `alert()` は使わない**（Electron でフォーカス不具合の原因になった実績あり）。削除確認は **`src/components/ConfirmDialog.tsx`** パターンを踏襲する
- 一覧まわりのスタイルは **`src/index.css`** の `.app-content-skin` と連動。薄いインディゴ文字だけが残らないよう、コントラストを維持する

## 用語（プロダクト）

- 「楽しみ」ではなく **「予定」**（映画公開日など）。日付なしの予定は **一覧のみ**（カレンダーには出さない仕様）

## ゲーミフィケーション（RPG 要素）

- **EXP 付与**（素地の例）: TODO 登録 / 完了、TIL・筋トレ・予定・目標の新規。実数は `electron/gamification.ts` の `RAW_XP`、到達 EXP には **特典の乗算**が掛かる
- **レベル・特典**: 累計 EXP から段階的に **称号**・**EXP ボーナス%** 等を解放（定義は同ファイルの `PERK_DEFINITIONS`）
- **ストリーク**: 「EXP が付与された日」で区切る（純粋な暦日の未起動ストリークではない）
- **ウィークリー要約**: 週の区切りは **月曜始まり**（`buildMotivationBoard`）
- **レベルアップ**: メインプロセスが `gamification:level-up` を送信し、レイアウトでモーダル表示。EXP の全体倍率は `electron/gamification.ts` の **`XP_GLOBAL_MULTIPLIER`**

## 機能追加・変更時のチェックリスト

1. **データモデル**: `electron/store.ts` と `src/types/` を同期
2. **IPC**: `electron/main.ts` の `ipcMain.handle` と `electron/preload.ts` の `expose` と **`src/vite-env.d.ts`** の型を揃える
3. **レンダラー**: `src/lib/api.ts` の `getAPI()` 経由で IPC を呼ぶ（直接 `ipcRenderer` は preload 以外で使わない）
4. ビルド通過と、該当画面の表示・削除フローを目視確認

## ドキュメント更新

アーキテクチャやデータ保存に触れたら **`docs/architecture.md`** を更新する。エージェント向けルールを変えたら **`.cursor/rules/`** を更新する。
