# Web Worker を typescript でいい感じに使う

## モチベーション

メインスレッドからの呼び出しと Worker スレッドからのレスポンスを型安全でいい感じにやりたい

## アプローチ

workerTaskCreator というタスク名とタスク関数を渡すと、worker 内で登録する関数と、タスクを呼び出す関数を返す関数を作ってみた

```typescript:addingTask.ts
import { workerTaskCreator } from './workerTaskCreator'

const adding = ([a, b]: [number, number]) => {
  return a + b
}

export const {
  registerTask: registerAddingTask,
  getTaskCaller: getAddingTaskCaller,
} = workerTaskCreator('adding', adding)
```

```typescript:worker.ts
import { registerAddingTask } from './addingTask'

registerAddingTask()
```

```typescript:main.ts
import Worker from './worker?worker'
import { getAddingTaskCaller } from './addingTask'

const worker = new Worker()
const adding = getAddingTaskCaller(worker)

adding([1, 2]).then((result) => {
  console.log(result)  // 3
})
```

## 複雑なので、シンプルに書いたほうがいいな

複数のタスクを登録できるようにしたけど、worker 使うくらいなら 1 つの worker で 1 つのタスクだそうし  
結局ベタに書くのがシンプルでわかりやすい

一つのファイルに以下のように書くのがいいかもな

- タスクのパラメーターの型
- タスクの結果の型
- 呼び出しの message イベントの型
- 結果の message イベントの型
- worker スレッドででタスクを登録する関数
- メインスレッドでタスクを呼び出す関数を返す関数

```typescript:niceTask.ts
type NiceTaskParams = {
  name: string
  age: 20
}

type NiceTaskResult = string

type CallMessage = {
  id: string
  params: NiceTaskParams
}

type ResultMessage = {
  id: string
  result: NiceTaskResult
}
```
