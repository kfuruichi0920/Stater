# テーブル設計ドキュメント

## 1. 前提
- ストレージは IndexedDB (Dexie) を利用。プロジェクト単位で JSON エクスポート/インポート可能。
- ID は UUIDv4 文字列。`createdAt`, `updatedAt` は ISO8601 文字列。
- `projectId` で論理的にスコープを分離し、クロス参照は外部キー相当の整合チェックをアプリ層で行う。

## 2. テーブル定義

### projects
- `id` (PK)
- `name`
- `theme` ("light"|"dark"|"serendie")
- `createdAt`, `updatedAt`

### stateLists
- `id` (PK)
- `projectId` (FK: projects.id)
- `name`

### states
- `id` (PK)
- `stateListId` (FK: stateLists.id)
- `name`
- `parentId` (nullable, FK: states.id) — 階層状態
- `meta` (JSON)

### eventLists
- `id` (PK)
- `projectId` (FK: projects.id)
- `name`

### events
- `id` (PK)
- `eventListId` (FK: eventLists.id)
- `name`
- `meta` (JSON)

### transitionTables
- `id` (PK)
- `projectId` (FK: projects.id)
- `stateListId` (FK: stateLists.id)
- `eventListId` (FK: eventLists.id)
- `name`

### transitionCells
- `id` (PK)
- `tableId` (FK: transitionTables.id)
- `stateId` (FK: states.id)
- `eventId` (FK: events.id)
- `nextStateId` (nullable, FK: states.id)
- `actionCode` (string; 擬似コード)
- `notes` (string)
- `collapsed` (bool)

### diagrams
- `id` (PK)
- `projectId` (FK: projects.id)
- `layoutType` ("elk"|"dagre"|other)
- `name`

### diagramNodes
- `id` (PK)
- `diagramId` (FK: diagrams.id)
- `stateId` (FK: states.id)
- `x`, `y`, `width`, `height` (number)

### diagramEdges
- `id` (PK)
- `diagramId` (FK: diagrams.id)
- `sourceId` (FK: states.id)
- `targetId` (FK: states.id)
- `label`

### variables
- `id` (PK)
- `projectId` (FK: projects.id)
- `name`
- `type` ("number"|"string"|"bool"|"any")
- `initValue` (JSON)

### constants
- `id` (PK)
- `projectId` (FK: projects.id)
- `name`
- `value` (JSON)

### templates
- `id` (PK)
- `projectId` (FK: projects.id)
- `name`
- `type` ("markdown"|"excel"|"custom")
- `content` (string)

### simulations
- `id` (PK)
- `projectId` (FK: projects.id)
- `scenarioJson` (JSON: initialState, initialVars, eventSequence)
- `logsJson` (JSON: step logs with stmtId/varsDelta/stateDelta/emits/type)
- `reportJson` (JSON: aggregated series for表/折れ線/ステップチャート)

### panels
- `id` (PK)
- `projectId` (FK: projects.id)
- `transitionId` (FK: transitionTables.id)
- `view` ("table"|"diagram")
- `zoom` (number)
- `layout` (JSON: x,y,width,height, snapped)

### settings
- `projectId` (PK=FK: projects.id)
- `autoSaveIntervalSec` (number)
- `language` (string)
- `llmEnabled` (bool)
- `lastExplorerSide` ("left"|"right")

## 3. インデックス設計（Dexie stores 例）
- projects: `id, name`
- stateLists: `id, projectId, name`
- states: `id, stateListId, parentId, name`
- eventLists: `id, projectId, name`
- events: `id, eventListId, name`
- transitionTables: `id, projectId, stateListId, eventListId`
- transitionCells: `id, tableId, stateId, eventId`
- diagrams: `id, projectId`
- diagramNodes: `id, diagramId, stateId`
- diagramEdges: `id, diagramId, sourceId, targetId`
- variables: `id, projectId, name`
- constants: `id, projectId, name`
- templates: `id, projectId, type`
- simulations: `id, projectId`
- panels: `id, projectId`
- settings: `projectId`

## 4. 整合性・制約（アプリ層）
- state/event/transition/diagram は同一 `projectId` に属することを保存前に検証。
- `nextStateId` は `stateListId` 内の state に限定する。
- 削除時は参照先がないことを確認し、必要に応じてカスケード削除を実装。
- `logsJson` は step 数が多くなるため、必要に応じて圧縮（LZ4 等）を将来検討。

## 5. エクスポート/インポート
- プロジェクト単位で JSON を生成し、テーブル間の ID を保持する。
- バージョン管理: JSON に `schemaVersion` を含め、将来のマイグレーション時に旧版を判別。
