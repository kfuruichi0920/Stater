# Stater

State Transition Modeling and Simulation Tool

## 概要

Stater は、状態遷移のモデリングとシミュレーションを行うデスクトップアプリケーションです。

## 技術スタック

- **Electron**: デスクトップアプリケーションフレームワーク
- **Vite**: 高速ビルドツール
- **React 18**: UIフレームワーク
- **TypeScript**: 型安全な開発
- **Zustand + Immer**: 状態管理
- **Dexie**: IndexedDB ラッパー
- **AG Grid**: 状態遷移表
- **React Flow**: 状態遷移図
- **Monaco Editor**: コードエディタ
- **Chevrotain**: DSLパーサ

## 開発環境のセットアップ

### 前提条件

- Node.js 18 以上
- npm 9 以上

### インストール

```bash
npm install
```

### 開発サーバーの起動

```bash
npm run dev
```

### ビルド

```bash
npm run build
```

### テストの実行

```bash
npm test
```

### Lint

```bash
npm run lint
```

## プロジェクト構造

```
stater/
├── electron/          # Electron メインプロセス
│   ├── main.ts        # メインプロセスエントリポイント
│   └── preload.ts     # プリロードスクリプト
├── src/               # React アプリケーション
│   ├── core/          # ビジネスロジック
│   │   ├── models/    # データモデル
│   │   ├── db/        # データベース(Dexie)
│   │   └── dsl/       # DSLパーサ・インタプリタ
│   ├── stores/        # Zustand ストア
│   ├── components/    # React コンポーネント
│   ├── types/         # TypeScript 型定義
│   ├── App.tsx        # ルートコンポーネント
│   └── main.tsx       # エントリポイント
├── test/              # テストファイル
└── doc/               # 設計ドキュメント
```

## ドキュメント

設計ドキュメントは `doc/` ディレクトリに格納されています。

- [ソフトウェア要求仕様](doc/11_software_requirement_specification.md)
- [機能設計](doc/22_function_design_document.md)
- [UX設計](doc/23_ux_design_document.md)
- [テーブル設計](doc/24_table_design_document.md)
- [アルゴリズム設計](doc/25_algorithm_design_document.md)

## ライセンス

MIT
