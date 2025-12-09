# SW要求仕様書

## 1. 目的
- 本書は「状態遷移設計支援ツール」のソフトウェア要求を明確化し、以降の詳細設計・実装・テストの基準とする。
- 開発環境は Electron + TypeScript を前提とし、デスクトップアプリとして提供する。

## 2. 対象読者
- プロダクトオーナー、UX デザイナー、開発者、テスター、運用担当。

## 3. システム概要
- 状態遷移表と状態遷移図を用いた設計を支援し、階層型状態遷移・擬似コード記述・シミュレーション・多形式エクスポート・LLM 支援を備えるオフライン指向のデスクトップアプリ。

## 4. 前提条件・制約
- 端末 OS: Windows / macOS / Linux（Electron サポート範囲）。
- ネットワークなしでも主要機能が動作すること（LLM 連携はオンラインを前提）。
- 保存形式はプロジェクト単位のローカルファイル（JSON/SQLite/IndexedDB）とし、外部 DB への依存なし。
- UI 言語: 日本語優先（多言語対応は将来課題）。

## 5. 用語
- 状態リスト: 状態の集合。複数定義可。
- イベントリスト: イベントの集合。複数定義可。
- 状態遷移表: 行=イベント、列=状態、セル=遷移先／処理の対応表。
- 状態遷移図: Node/Connector で表現するグラフ。
- 階層状態: 親子関係をもつ状態。
- 擬似コード: 内蔵 DSL で記述する手続き。

## 6. アーキテクチャ方針・技術選定
- **フレームワーク**: Electron + Vite + React(TypeScript)  
  - 理由: 開発生産性、エコシステム、クロスプラットフォーム配布の容易さ。
- **状態管理**: Zustand + Immer  
  - 理由: シンプルで局所的なグローバル状態管理、Undo/Redo 実装容易。
- **UI コンポーネント**: MUI (Material UI) + 自前テーマ変数  
  - 理由: デスクトップライクな操作性とテーマカスタムの両立。
- **グリッド**: AG Grid Community（Handsontable CE と比較 PoC の結果で採用）  
  - 理由: 固定ヘッダ・仮想スクロール性能、Row Group/Tree Data による階層折畳、カスタムセルエディタ API が充実し無償版で要件を満たす。
- **ダイアグラム**: React Flow + elkjs（デフォルト）/ dagre（オプション）  
  - 理由: elkjs の階層レイアウト品質を優先しつつ、軽量な dagre を代替として残す。UI から切替可。
- **コードエディタ**: Monaco Editor  
  - 理由: VS Code 相当の編集体験とシンタックスハイライト。
- **DSL/パーサ**: Chevrotain (または Nearley) で擬似コード文法を定義。
- **データ保存**: IndexedDB(Dexie) + プロジェクトファイルの JSON エクスポート/インポート。  
- **ファイル出力**: exceljs（XLSX）, markdown-it/remark（Markdown）, Handlebars（テンプレート出力）。
- **検索/ハイライト**: Fuse.js（全文検索）+ カスタムハイライト層。
- **シミュレーションログ**: structured-clone 互換の JSON ログ、表示に React Table。
- **LLM 連携**: OpenAI API ラッパー（後日 API キー設定）。  
- **テスト**: Vitest + Playwright（E2E 部分）。

## 7. 機能要求（機能 ID 付与）
- FR-001: 状態遷移表をスプレッドシート感覚で編集（行=イベント、列=状態）。固定ヘッダ・仮想スクロール対応。
- FR-002: 表セルに「遷移先」「処理（擬似コード）」を記入。表示切替（処理のみ/遷移先のみ/両方）。
- FR-003: 行折畳/展開を行単位および全体一括で切替。
- FR-004: 文字列検索とフィルタ。ヒットセルのハイライト、検索結果ダイアログとセル連動移動。
- FR-005: 拡大/縮小（Ctrl+ホイール、ショートカット）。
- FR-006: 状態遷移図の作成・編集（マウス/キーボード両対応）。
- FR-007: 複数レイアウトエンジン（dagre/elkjs 等）による自動配置。
- FR-008: 階層型状態遷移の表現と編集（親子ノード、折畳）。
- FR-009: 複数のイベントリストを作成・遷移表で選択。
- FR-010: 複数の状態リストを作成・遷移表で選択。
- FR-011: 擬似コード編集（セル内編集/ダイアログ編集、シンタックスハイライト、補完）。
- FR-012: 擬似コードからアクション図を生成・表示。
- FR-013: シミュレーション（初期状態・変数設定、イベント列設定、開始/一時停止/再開、ログ出力、完了レポート）。
- FR-014: 変数・定数の事前定義、順次/分岐/反復の組込みキーワードを用いた DSL 実行。
- FR-015: 状態遷移表のエクスポート（Excel, Markdown）。
- FR-016: 状態遷移表からテンプレートに従った出力（任意書式、Handlebars）。
- FR-017: 状態遷移表から任意言語コード生成（LLM 支援、ユーザーが言語指定）。
- FR-018: 任意言語コードから状態遷移表へのリバース（LLM 支援）。
- FR-019: 複数状態遷移のエクスプローラ（サイドバー）での参照/折畳/展開/複製/削除。表示位置を左右切替、非表示可。
- FR-020: 編集領域に複数パネルを配置し、最小化/最大化/任意リサイズ可。パネルごとに任意の状態遷移を表示。
- FR-021: 同一状態遷移を複数パネルで開き、表と図を連動編集。
- FR-022: カラーテーマ切替。
- FR-023: ビュー選択（表/図）を状態遷移ごとに指定。

## 8. UI/UX 要件
- グリッド: 固定ヘッダ、仮想スクロール、セル編集、ショートカット（コピー/ペースト/Undo/Redo）。
- ズーム: Ctrl+ホイール、+/- キー。ズーム倍率は 25–400% 範囲。
- 検索 UI: 検索バー + 結果ダイアログ。ダイアログ選択で該当セルへフォーカス移動。
- 図編集: ドラッグでノード配置、キーボードで移動/複製/削除、スナップライン表示。
- レイアウト選択: プルダウンで dagre/elkjs 等。適用後に手動微調整可能。
- パネル: ドッキング/フローティング風のリサイズハンドル、最小化ボタン、最大化ボタン。
- アクセシビリティ: 主要操作にキーボードショートカット、フォーカスリング表示。

## 9. データモデル要件（概念レベル）
- Project { id, name, theme, stateLists[], eventLists[], transitions[], diagrams[], variables[], constants[], panels[], settings }
- StateList { id, name, states[] } （state は {id, name, parentId?, metadata}）
- EventList { id, name, events[] } （event は {id, name, metadata}）
- TransitionTable { id, stateListId, eventListId, cells[] }  
  - Cell { eventId, stateId, nextStateId?, actionCode?, notes?, collapsed? }
- Diagram { id, nodes[], edges[], layoutType }
- PseudoCode { id, text, ast?, actionDiagram? }
- SimulationScenario { id, initialState, initialVars, eventSequence[], logs[], report }
- Template { id, name, type(markdown/excel/custom), content }

## 10. 擬似コード仕様（概要）
- 文法: 順次 `;`、条件 `if/elseif/else/end`, 反復 `for/while/end`、代入、関数呼び出し、イベント発火をキーワードで提供。
- 変数・定数は事前宣言。型は疎指定（number/string/bool/any）。
- 構文木を生成し、実行エンジンとアクション図生成で共用。
- エディタ機能: シンタックスハイライト、簡易補完、エラーマーカー。

## 11. シミュレーション要件
- 初期設定 UI で状態・変数を指定。
- イベント列を順序付きで設定し、シミュレーション実行。
- 各イベント毎に: 処理ステップログ、変数更新ログ、状態遷移ログを保存。
- 一時停止/再開をサポートし、UI に現在ステップ表示。
- 完了後、変数遷移・状態遷移のレポートを生成（表形式・チャート）。

## 12. インポート/エクスポート・LLM 連携
- エクスポート: Excel (exceljs), Markdown, 任意テンプレート (Handlebars)。
- コード生成: LLM に状態遷移表を渡し、指定言語のコードを生成。生成結果は表示と同時にトレーサビリティ付きで保存。
- リバース: 任意言語コードを入力し、LLM で状態・イベント・遷移を抽出して表に変換。ユーザー確認ダイアログを挟む。
- オフライン時はエクスポート系のみ動作、LLM 機能は無効化表示。

## 13. 非機能要件
- 性能: 1 万セル規模の表で操作遅延 100ms 以内（ターゲットマシン: 4C/8G クラス）。
- 起動時間: 3 秒以内（キャッシュビルド後）。
- 信頼性: Undo/Redo 100 ステップ保持。自動保存間隔 30 秒（設定可）。
- 可用性: クラッシュ時に自動復旧可能なスナップショットを保持。
- ユーザビリティ: 主要操作にショートカット提示、ツールチップ提供。
- セキュリティ: プロジェクトデータはローカル保存。LLM 送信前に確認ダイアログとマスキングオプション。
- 保守性: モジュール分割（core:モデル/DSL/シミュレータ、ui:表/図/パネル、infra:保存/エクスポート/LLM）。

## 14. 運用・設定・ログ
- 設定: テーマ、保存場所、オートセーブ間隔、LLM API キーを設定画面で管理。
- ログ: シミュレーションログ、エラーログ、ユーザー操作ログ（デバッグ用トグル）。
- 更新: 自動アップデート通知（Electron autoUpdater）を将来対応項目とする。

## 15. 受入れ基準（サンプル）
- 上記 FR-001〜FR-023 がデモで確認できること。
- 代表的なプロジェクトを Excel と Markdown に正しく出力できること。
- 擬似コードの if/for/while を含むサンプルがシミュレーションで正しく実行されること。
- dagre/elkjs いずれかでレイアウトが適用され、手動編集が保持されること。

## 16. 追加検討結果（1〜3）
- **(1) グリッド & レイアウトエンジン PoC**  
  - 観点: スクロール性能（1 万セル）、固定ヘッダ、階層折畳、カスタムセル編集 API、ライセンス、周辺エコシステム。  
  - 結果: AG Grid Community が要件を無償で充足し、性能余裕あり。Handsontable CE は階層折畳とカスタム編集で追加実装コスト増。  
  - 図レイアウト: elkjs を標準（階層・重なり解消が安定）、dagre を軽量代替として残す。

- **(2) 擬似コード DSL 最小文法 & AST 方針**  
  - 文法（EBNF 抜粋）:  
    - `program ::= stmt*`  
    - `stmt ::= assign | ifStmt | whileStmt | forStmt | call | emit | block`  
    - `assign ::= IDENT '=' expr`  
    - `ifStmt ::= 'if' expr block ('elseif' expr block)* ('else' block)? 'end'`  
    - `whileStmt ::= 'while' expr block 'end'`  
    - `forStmt ::= 'for' IDENT 'in' range block 'end'`  
    - `emit ::= 'emit' IDENT '(' args? ')'`  
    - `block ::= NEWLINE+ stmt* 'end'?`  
  - AST ノード例: Program, Block, Assign(id, expr), If(test, cons[], alt?), While(test, body), For(iter, range, body), Call(callee, args), Emit(eventId, args), Literal/Identifier/Binary。  
  - 実行エンジン: AST を直接解釈、ステップ毎に変数・状態・ログをフック。アクション図生成は AST を走査し分岐/反復をノード化。

- **(3) 永続化スキーマ（IndexedDB/Dexie）**  
  - DB バージョン 1 テーブル案:  
    - `projects(id, name, theme, createdAt, updatedAt)`  
    - `stateLists(id, projectId, name)` / `states(id, stateListId, name, parentId, meta)`  
    - `eventLists(id, projectId, name)` / `events(id, eventListId, name, meta)`  
    - `transitionTables(id, projectId, stateListId, eventListId, name)`  
    - `transitionCells(id, tableId, stateId, eventId, nextStateId, actionCode, notes, collapsed)`  
    - `diagrams(id, projectId, layoutType)` / `diagramNodes(id, diagramId, stateId, x, y, width, height)` / `diagramEdges(id, diagramId, sourceId, targetId, label)`  
    - `variables(id, projectId, name, type, initValue)` / `constants(id, projectId, name, value)`  
    - `templates(id, projectId, name, type, content)`  
    - `simulations(id, projectId, scenarioJson, logsJson, reportJson)`  
  - 保存単位: プロジェクトを JSON でエクスポート/インポートし、DB はキャッシュ兼編集用。  
  - マイグレーション: Dexie の `version(n).stores()` で段階追加、旧バージョンは JSON エクスポート→インポートでアップグレードするパスを用意。

## 17. 今後の課題
- 多言語 UI、チーム共有（クラウド同期）、リアルタイム協調編集。
- プラグイン機構（外部テンプレート/変換器の追加）。
- 形式検証ツールとの連携（例: model checking）。
