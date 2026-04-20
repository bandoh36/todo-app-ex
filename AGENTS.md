# Agent / 協働開発向けガイド

このリポジトリでエージェントや AI 支援ツールが作業する際の起点です。詳細は次を参照してください。

| ドキュメント | 内容 |
|--------------|------|
| [docs/instructions.md](docs/instructions.md) | 運用ルール・禁止事項・変更時チェックリスト |
| [docs/architecture.md](docs/architecture.md) | 構成・データフロー・主要ディレクトリ |
| [.cursor/rules/](.cursor/rules/) | Cursor 用ルール（常時 / ファイル別） |
| [.cursor/skills/mytodo-dev/SKILL.md](.cursor/skills/mytodo-dev/SKILL.md) | このプロジェクト専用ワークフロー |

**最短コマンド**: `npm install` → `npm run dev`（開発）、`npm run build`（型検査＋ビルド）。
