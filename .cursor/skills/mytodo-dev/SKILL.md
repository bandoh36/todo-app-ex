---
name: mytodo-dev
description: >-
  Maintains and extends the MyTODO Electron app (React/Vite/Electron IPC, Tailwind,
  JSON store under ./data/data.json). Use when editing this repository, adding features,
  fixing IPC/data/UI, running builds, or when the user mentions MyTODO, todo-app-ex,
  or AI-driven workflow for this project.
---

# MyTODO 開発ワークフロー

## 変更前に読む

1. `AGENTS.md` → `docs/instructions.md` → 触る層に応じて `docs/architecture.md`
2. データか IPC を変える場合: `electron/store.ts` → `electron/main.ts` → `electron/preload.ts` → `src/vite-env.d.ts`

## 実装の優先順位

1. 型とストア（`electron/store.ts` / `src/types/`）
2. IPC トリプル（main / preload / `vite-env.d.ts`）
3. UI と `getAPI()` 呼び出し
4. `npm run build` で検証

## 避けること

- レンダラーで `confirm()`（フォーカス問題の履歴あり）→ `ConfirmDialog` を使う
- IPC 経路の片方だけの追加
- `data/data.json` のコミット

## 成果物の出し方（PR・説明）

- **何を**: 一文
- **なぜ**: 一文
- **検証**: `npm run build` 結果、手元で確認した画面
