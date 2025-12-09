# アルゴリズム設計ドキュメント

## 1. 対象と方針
- 主要な挙動でロジックが重要な箇所のみ記述。実装は TypeScript 前提。
- 本版では以下を対象とする:
  1) DSL `break/continue` を含むインタプリタ制御フロー
  2) シミュレーション可視化用データ整形（折れ線/ステップチャート切替）
  3) パネルスナップドッキングのレイアウト計算

## 2. DSL インタプリタ（break/continue 対応）
- AST ノードに `Break` / `Continue` を追加。
- 実行ループは関数 `execBlock(block, env)` で走査し、戻り値に `{control?: 'break'|'continue', error?: RuntimeError}` を含める。

擬似コード:
```
execStmt(stmt, env):
  try:
    switch stmt.type:
      case 'Break': return {control: 'break'}
      case 'Continue': return {control: 'continue'}
      case 'While':
        while eval(expr):
          r = execBlock(body, env)
          if r.error: return r
          if r.control == 'break': break
          if r.control == 'continue': continue
        return {}
      case 'For':
        for v in range:
          bind(iter, v)
          r = execBlock(body, env)
          if r.error: return r
          if r.control == 'break': break
          if r.control == 'continue': continue
        return {}
      case 'Assign':
        value = eval(expr)
        env.set(id, value)
        return {}
      default:
        evalNonControl(stmt)
        return {}
  catch RuntimeError as e:
    return {error: e}

execBlock(block, env):
  for stmt in block:
    r = execStmt(stmt, env)
    if r.error or r.control: return r
  return {}
```
- ログ: 各ステップで `{stmtId, varsDelta, stateDelta, emits, type?, error?}` を push。`type` は break/continue のときのみ付与。
- エラーハンドリング: 詳細は後述 2.1 参照。

### 2.1 DSL実行時エラーハンドリング
**エラー種別と対応**:

1. **パースエラー**(構文エラー、未閉じブロック、未知トークン)
   - 検出タイミング: 擬似コード保存時(Monaco エディタでの編集中)
   - 通知方法: エディタ内にエラーマーカー(赤波線)と行番号付きメッセージを表示
   - メッセージ例: `行 5: 'end' が必要です`、`行 12: 未知のトークン '@@'`
   - 保存可否: パースエラーがある場合でも保存可能(警告として扱う)。シミュレーション実行時に再度エラーを表示。

2. **実行時エラー - 未定義変数**
   - 検出タイミング: シミュレーション実行中の変数参照時
   - 通知方法: シミュレーションを一時停止し、エラーダイアログを表示
   - メッセージ例: `行 8: 変数 'foo' が定義されていません`
   - 対処選択肢: 「デバッグ」(該当セルの編集ダイアログを開く)、「停止」(シミュレーション終了)

3. **実行時エラー - 型不一致**
   - 検出タイミング: 演算実行時(例: 文字列 + 数値)
   - 通知方法: 同上
   - メッセージ例: `行 10: 型エラー: "hello" + 42 は実行できません`
   - 対処選択肢: 同上

4. **実行時エラー - ゼロ除算**
   - 検出タイミング: 除算演算実行時
   - 通知方法: 同上
   - メッセージ例: `行 15: ゼロ除算エラー`
   - 対処選択肢: 同上

5. **実行時エラー - 無限ループ検出**
   - 検出タイミング: 同一ループで 10,000 イテレーション超過時
   - 通知方法: 警告ダイアログを表示し、「継続」「停止」を選択
   - メッセージ例: `行 20: 無限ループの可能性があります(10,000回反復)。継続しますか?`
   - 継続時: さらに 10,000 イテレーションまで実行可能(最大 100,000 で強制停止)

6. **状態遷移エラー - 不正な遷移先**
   - 検出タイミング: `nextStateId` が存在しない状態を参照時
   - 通知方法: シミュレーションを停止し、エラーダイアログを表示
   - メッセージ例: `セル (event=E1, state=S2): 遷移先状態 'S99' が存在しません`
   - 対処選択肢: 「編集」(該当セルを開く)、「閉じる」

7. **状態遷移エラー - イベント未定義**
   - 検出タイミング: `emit` で存在しないイベントを発火時
   - 通知方法: 警告として扱い、スキップして継続
   - メッセージ例: `行 25: イベント 'E99' は定義されていません。スキップします。`
   - ログ記録: 警告ログに記録

**共通方針**:
- エラーメッセージは必ず行番号を含める
- パースエラーはリアルタイムで表示し、保存をブロックしない(警告扱い)
- 実行時エラーはシミュレーションを一時停止し、ユーザーに対処方法を提示
- すべてのエラーはシミュレーションログに記録し、後から確認可能にする
- エラー発生ステップはタイムライン上で赤色マークし、ホバーで詳細を表示

## 3. シミュレーション可視化データ整形
- 入力: ステップログ配列 `steps[]`（時系列）。各ステップは `{stmtId, varsDelta, stateDelta, emits, type?, error?}` を含む。
- 出力: 折れ線用 series と ステップチャート用 series を共通データで生成。

擬似コード:
```
buildSeries(steps, key):
  // key: 'state' | 'var:foo'
  res = {line: [], step: []}
  last = null
  for i, step in enumerate(steps):
    val = extract(step, key)
    // 折れ線: (i, val)
    res.line.append({x:i, y:val})
    // ステップ: 前値を保持し、i で切り替え
    if last is None:
      res.step.append({x:i, y:val})
    else if val != last:
      res.step.append({x:i, y:last})  // 変化直前まで前値を維持
      res.step.append({x:i, y:val})   // 変化時点で新値に切替
    last = val
  return res
```
- 選択系列（状態/任意変数）ごとに生成し、UI で折れ線/ステップをトグル表示。
- **性能考慮**: ステップ数が 10,000 を超える場合、間引き(decimation)を適用。可視化に影響しない範囲で 1/10 に間引き。
- **メモリ考慮**: 生成した series は chart ライブラリに渡すまで保持し、描画後は GC 対象に。大量ステップ時は圧縮(LZ4)を検討。

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

## 5. レイアウトエンジン切替時の座標変換
- **課題**: elkjs と dagre ではレイアウトアルゴリズムが異なり、ノード座標が大きく変わる。ユーザーの手動調整を失わないよう、座標変換が必要。
- **方針**: 相対位置とスケールを保持し、新レイアウト適用後に可能な限り復元。

擬似コード:
```
convertCoordinates(oldNodes, newNodes, oldLayout, newLayout):
  // oldNodes: 旧レイアウトでのノード座標配列
  // newNodes: 新レイアウト適用後のノード座標配列
  // oldLayout/newLayout: レイアウトエンジン名('elk'|'dagre')

  // 1. 旧座標のバウンディングボックスを計算
  oldBBox = calculateBBox(oldNodes)

  // 2. 新座標のバウンディングボックスを計算
  newBBox = calculateBBox(newNodes)

  // 3. スケール比を計算
  scaleX = newBBox.width / oldBBox.width
  scaleY = newBBox.height / oldBBox.height

  // 4. 各ノードの相対位置を保持しつつスケール変換
  for node in oldNodes:
    relX = (node.x - oldBBox.minX) / oldBBox.width
    relY = (node.y - oldBBox.minY) / oldBBox.height
    node.x = newBBox.minX + relX * newBBox.width
    node.y = newBBox.minY + relY * newBBox.height

  return oldNodes
```

- **Undo/Redo 対応**: レイアウト切替前の座標を履歴に保存し、「元に戻す」で復元可能にする。
- **手動調整の扱い**: レイアウト適用後の手動調整座標は `manualAdjusted=true` フラグで記録。次回レイアウト適用時は手動調整を優先(上書きしない)。ユーザーが「レイアウトを再適用」を明示した場合のみ上書き。

## 6. テスト観点
- **DSL**: TC-09〜12 で break/continue 挙動を検証（ADR 92）。ネスト 3 段までを単体テスト。
- **エラーハンドリング**: パースエラー、実行時エラー(未定義変数、型不一致、ゼロ除算)、状態遷移エラー(不正な遷移先)の各種別をテストケース化。
- **可視化**: 折れ線/ステップ生成で定数列と階段列を比較し、重複点が増えないことを確認。10,000 ステップ超での間引き処理が正しく動作することを検証。
- **パネル**: ドラッグ後に最小幅/高さを下回らないこと、レイアウト保存/復元が id 単位で正しく行われること。
- **レイアウト変換**: elkjs → dagre、dagre → elkjs の双方向変換で、ノードの相対位置が保持されることを検証。手動調整フラグが正しく機能することを確認。
