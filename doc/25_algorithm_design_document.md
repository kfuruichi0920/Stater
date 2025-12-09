# アルゴリズム設計ドキュメント

## 1. 対象と方針
- 主要な挙動でロジックが重要な箇所のみ記述。実装は TypeScript 前提。
- 本版では以下を対象とする:
  1) DSL `break/continue` を含むインタプリタ制御フロー
  2) シミュレーション可視化用データ整形（折れ線/ステップチャート切替）
  3) パネルスナップドッキングのレイアウト計算

## 2. DSL インタプリタ（break/continue 対応）
- AST ノードに `Break` / `Continue` を追加。
- 実行ループは関数 `execBlock(block, env)` で走査し、戻り値に `{control?: 'break'|'continue'}` を含める。

擬似コード:
```
execStmt(stmt, env):
  switch stmt.type:
    case 'Break': return {control: 'break'}
    case 'Continue': return {control: 'continue'}
    case 'While':
      while eval(expr):
        r = execBlock(body, env)
        if r.control == 'break': break
        if r.control == 'continue': continue
      return {}
    case 'For':
      for v in range:
        bind(iter, v)
        r = execBlock(body, env)
        if r.control == 'break': break
        if r.control == 'continue': continue
      return {}
    default:
      evalNonControl(stmt)
      return {}

execBlock(block, env):
  for stmt in block:
    r = execStmt(stmt, env)
    if r.control: return r
  return {}
```
- ログ: 各ステップで `{stmtId, varsDelta, stateDelta, emits, type?}` を push。`type` は break/continue のときのみ付与。
- エラーハンドリング: ループ外で `Break/Continue` が来たら即パースエラー（実行時には出ない）。

## 3. シミュレーション可視化データ整形
- 入力: ステップログ配列 `steps[]`（時系列）。
- 出力: 折れ線用 series と ステップチャート用 series を共通データで生成。

擬似コード:
```
buildSeries(steps, key):
  // key: 'state' | 'var:foo'
  res = []
  last = null
  for i, step in enumerate(steps):
    val = extract(step, key)
    // 折れ線: (i, val)
    res.line.append({x:i, y:val})
    // ステップ: 前値を保持し、i で切り替え
    if last is None:
      res.step.append({x:i, y:val})
    else if val != last:
      res.step.append({x:i, y:last})
      res.step.append({x:i, y:val})
    last = val
  return res
```
- 選択系列（状態/任意変数）ごとに生成し、UI で折れ線/ステップをトグル表示。

## 4. パネルスナップドッキング計算
- 画面を仮想グリッド（例: 16px）にスナップ。ドラッグ終了時に `x,y,width,height` を最寄りグリッドへ丸める。

擬似コード:
```
snap(value, grid=16): return round(value / grid) * grid

onDragEnd(rect):
  rect.x = snap(rect.x)
  rect.y = snap(rect.y)
  rect.width = max(minWidth, snap(rect.width))
  rect.height = max(minHeight, snap(rect.height))
  saveLayout(rect)
```
- 保存: パネルごとに `{x,y,width,height,snapped:true}` を Dexie に保存し、再表示時に復元。
- 将来 GoldenLayout 風へ拡張する場合でも、スナップ丸め部分を差し替え可能な関数に抽象化。

## 5. テスト観点
- DSL: TC-09〜12 で break/continue 挙動を検証（ADR 92）。ネスト 3 段までを単体テスト。
- 可視化: 折れ線/ステップ生成で定数列と階段列を比較し、重複点が増えないことを確認。
- パネル: ドラッグ後に最小幅/高さを下回らないこと、レイアウト保存/復元が id 単位で正しく行われること。
