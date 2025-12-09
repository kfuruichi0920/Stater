# 擬似コード検証結果

## 1. 検証目的
- SW要求仕様書で定義した擬似コード DSL 最小文法が、シミュレーション機能とアクション図生成に十分かを確認する。
- 想定ユースケース（状態遷移セル内の処理記述）で表現力と実装容易性を評価する。

## 2. 文法サマリ（再掲）
- `program ::= stmt*`
- `stmt ::= assign | ifStmt | whileStmt | forStmt | call | emit | block`
- `assign ::= IDENT '=' expr`
- `ifStmt ::= 'if' expr block ('elseif' expr block)* ('else' block)? 'end'`
- `whileStmt ::= 'while' expr block 'end'`
- `forStmt ::= 'for' IDENT 'in' range block 'end'`
- `emit ::= 'emit' IDENT '(' args? ')'`
- `block ::= NEWLINE+ stmt* 'end'?`
- `expr ::= literal | IDENT | binary | call`
- `range ::= expr '..' expr | expr '..<' expr`

## 3. テストケース設計
- TC-01: 単純代入と算術 `x = a + 3*2`
- TC-02: if/elseif/else のネスト
- TC-03: while ループ内での emit と変数更新
- TC-04: for range (閉区間/半開区間) と break なし想定
- TC-05: 関数呼び出しと戻り値使用 `result = foo(x, y)`
- TC-06: イベント発火のみの最小スクリプト `emit EVT_A()`
- TC-07: アクション図生成の分岐・反復ノード整形（AST→Graph）
- TC-08: 無効トークン／未閉じブロックのエラーハンドリング

## 4. 実装メモ（検証用プロトタイプレベル）
- パーサ: Chevrotain で LL(k) トークナイザ＋パーサを構築。  
  - 主要トークン: Identifier, Number, String, If, ElseIf, Else, End, While, For, In, Emit, Return, Operator(+ - * / % == != < > <= >= && ||), Range(`..`, `..<`), Assign(`=`), Paren/Comma/Newline。  
  - Newline を文末トークンとして扱い、ブロック境界はキーワードで閉じるためインデント依存なし。
- AST 生成: CST Visitor で Program/Block/Assign/If/While/For/Call/Emit/Binary/Literal/Identifier を生成。
- 実行エンジン:  
  - 環境: { vars, constants, state, emitLog[], stepLog[] }  
  - 各ステートメントで `stepLog` に {stmtId, varsDelta, stateDelta, emits} を push。  
  - emit は `emitLog` に {eventId, args, atStep} を追加。  
  - 例外はステップ番号付きで報告。
- アクション図生成:  
  - AST を DFS で走査し、順次ノードを直線で接続。  
  - If: 分岐ノード→ then/elseif/else サブグラフ→ マージノード。  
  - While/For: 条件ノード→本体ノード→戻りエッジ→マージ。  
  - 出力形式は React Flow 用ノード/エッジ JSON。

## 5. 検証結果
- TC-01〜TC-07: 期待 AST が生成され、インタプリタで正常に評価。変数更新と emit ログがステップ単位で取得できた。  
- アクション図: If/While の分岐・ループがノードに正しく変換され、React Flow で描画確認（簡易モックデータ）。  
- TC-08:  
  - 未閉じ `if` / `while` で構文エラーを検出し、行番号付きメッセージを返却。  
  - 不明キーワードは Lexing で弾き、復旧はエラー後に次の改行までスキップする簡易戦略で十分と判断。

## 6. 仕様へのフィードバック
- ループ脱出 `break` / `continue` があるとシミュレーションでの分岐表現が自然になるため、拡張予約。  
- 関数定義は当面不要（セル内の粒度想定）。  
- 例外 `throw` は未サポートのままにし、将来のエラーフロー設計で再検討。  
- Range 演算子は `..<`（終端除外）を追加済み、UI ヘルプに明記する。

## 7. 今後のタスク
- 文法拡張オプション（break/continue）の PoC。  
- Monaco Editor へのシンタックス/エラーマーカー統合。  
- アクション図ノードレイアウトの最適化（長い then/else での自動折返し）。  
- ステップログをシミュレーションレポートに組込むデータフォーマット定義。
