# MyTODO

日々の TIL・筋トレ・楽しみ・目標を管理する Electron デスクトップアプリです。

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

データは Electron の `userData` ディレクトリ内の `data/data.json` に保存されます。

- Windows: `%APPDATA%/my-todo-app/data/data.json`
- macOS: `~/Library/Application Support/my-todo-app/data/data.json`

## 機能

- **ダッシュボード**: 今日の TIL・筋トレ・楽しみイベント、直近の TIL
- **TIL**: 学んだことのタイトル・内容・リンク、目標との紐付け
- **筋トレ**: 日付と内容の記録
- **カレンダー**: 月表示で TIL/筋トレ/楽しみイベントの有無を表示、日付クリックで TIL 新規作成
- **楽しみ**: 映画の公開日などのイベント登録
- **目標**: 目標の管理、TIL と紐付け
