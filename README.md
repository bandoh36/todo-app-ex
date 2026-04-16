# MyTODO

日々の TIL・筋トレ・予定・目標を管理する Electron デスクトップアプリです。

## 技術スタック

- Electron 40 + React 19 + Vite 7 + TypeScript
- Tailwind CSS 4
- react-router-dom v7

## セットアップ

```bash
npm install
```

## 開発

```bash
npm run dev
```

Vite の開発サーバーと Electron が起動します。

## ビルド・配布

```bash
# 本番ビルド
npm run build

# ビルド後に Electron で起動
npm run start

# Windows 用インストーラ作成
npm run build:win

# 全プラットフォーム用
npm run build:all
```

## データの保存場所

データはプロジェクト直下の `data/data.json` に保存されます。

- パス: `./data/data.json`
- 旧保存先（`%APPDATA%/my-todo-app/data/data.json`）にデータがある場合、初回起動時に自動で移行されます。

## 機能

- **ダッシュボード**: 今日の TIL・筋トレ・予定、直近の TIL
- **TIL**: 学んだことのタイトル・内容・リンク、目標との紐付け
- **筋トレ**: 日付と内容の記録
- **カレンダー**: 月表示で TIL/筋トレ/予定の有無を表示、日付クリックで TIL 新規作成
- **予定**: 映画の公開日などの予定登録（日時未定でも登録可能。日時未定はカレンダー非表示で予定一覧のみ表示）
- **目標**: 目標の管理、TIL と紐付け
