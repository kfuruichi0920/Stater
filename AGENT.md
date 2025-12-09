# 作業指示書

## 0. 基本
* 思考は英語、回答は日本語とすること。
* 管理者に操作依頼が必要な場合は、依頼すること。

## 1. 作業プロトコル
* 作業指示が不明、曖昧であれば質問すること。
* 作業終了時、以下を実施する。
  1. 作業記録の作成。`doc/82_specification_journal.md` に従うこと。
  2. 設計書の更新。`doc/83_specification_software_design_document.md` に従うこと。

## 2. 開発プロセス
* SDD(仕様駆動開発) + TDD(テスト駆動開発)とする。
* SDDにあたり、ドキュメント構成は以下。
```
11_software_requirement_specification.md
 |- doc/21_operation_design_document
 |- doc/22_function_design_document.md
 |- doc/23_ux_design_document.md
 |- doc/24_table_design_document.md
 |- doc/25_algorithm_design_document.md
 |- doc/26_detail_design_document.md
```
* テストファイルは`test/`配下に作成する。

## 3. 設計・実装原則
* 疎結合
* 実装コードにはコメントを書くこと。(`doc/85_specification_comment.md`)

## 4. コミットコメント
* コミットルールに従う。(`doc/84_specification_commit_message.md`)
