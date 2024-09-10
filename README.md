# Web Worker を typescript でいい感じに使う

## モチベーション

メインスレッドからの呼び出しと Worker スレッドからのレスポンスを型安全でいい感じにやりたい

## アプローチ

workerTaskCreator というタスク名とタスク関数を渡すと、worker 内で登録する関数と、タスクを呼び出す関数を返す関数を作ってみた

```typescript
// addingTask.ts
import { workerTaskCreator } from './workerTaskCreator'

const adding = ([a, b]: [number, number]) => {
  return a + b
}

export const {
  registerTask: registerAddingTask,
  getTaskCaller: getAddingTaskCaller,
} = workerTaskCreator('adding', adding)
```

```typescript
// fetchJsonTask.ts
import { workerTaskCreator } from './workerTaskCreator'

// 時間のかかる処理
const fetchJsonTask = async (url: string) => {
  const res = await fetch(url)
  return res.json()
}

export const {
  registerTask: registerFetchJsonTask,
  getTaskCaller: getFetchJsonTaskCaller,
} = workerTaskCreator('fetchJsonTask', fetchJsonTask)
```

```typescript
// worker.ts
import { registerAddingTask } from './addingTask'
import { registerFetchJsonTask } from './fetchJsonTask'

registerAddingTask()
registerFetchJsonTask()
```

```typescript
// main.ts
import Worker from './worker?worker'
import { getAddingTaskCaller } from './addingTask'
import { getFetchJsonTaskCaller } from './fetchJsonTask'

const worker = new Worker()
const adding = getAddingTaskCaller(worker)
const fetchJson = getFetchJsonTaskCaller(worker)

adding([1, 2]).then((result) => {
  console.log(result) // 3
})

fetchJson('/pathto/nice.json').then((result) => {
  console.log(result) // json object
})
```

## 複雑なので、シンプルに書いたほうがいいな

上記のライブラリ作ってみて思ったが、なんだかんだわかりづらい
複数のタスクを登録できるようにしたけど、worker 使うくらいなら 1 つの worker で 1 つのタスクがいいだろうし
結局ベタに書くのがシンプルでわかりやすい

一つのファイルに以下のように書くのがいいかもな

- タスクのパラメーターの型
- タスクの結果の型
- 呼び出しの message イベントの型
- 結果の message イベントの型
- worker スレッドででタスクを登録する関数
- メインスレッドでタスクを呼び出す関数を返す関数

```typescript
// niceTask.ts

// タスクのパラメーターの型
type NiceTaskParams = {
  name: string
  age: 20
}

// タスクの結果の型
type NiceTaskResult = string

// 呼び出しの message イベントの型
type CallMessage = {
  id: string
  params: NiceTaskParams
}

// 結果の message イベントの型
type ResultMessage = {
  id: string
  result: NiceTaskResult
}

// worker スレッドでおこなうタスクの関数
const niceTask = ({ name, age }: NiceTaskParams): NiceTaskResult => {
  return `I'm ${name} and ${age} years old`
}

// worker スレッドでタスクを登録する関数
export const registerNiceTask = () => {
  self.addEventListener('message', (e: MessageEvent<CallMessage>) => {
    const { id, params } = e.data
    const result = niceTask(params)
    const resultMessage: ResultMessage = { id, result }
    self.postMessage(resultMessage)
  })
}

// メインスレッドでタスクを登録したworkerを引数に呼び出す関数を返す関数
export const getNiceTaskCaller = (worker: Worker) => {
  return (params: NiceTaskParams) => {
    return new Promise<NiceTaskResult>((resolve) => {
      const id = Math.random().toString(36) + performance.now().toString(36)
      const handleMessage = (e: MessageEvent<ResultMessage>) => {
        if (e.data.id === id) {
          resolve(e.data.result)
          worker.removeEventListener('message', handleMessage)
        }
      }
      worker.addEventListener('message', handleMessage)
      const callMessage: CallMessage = { id, params }
      worker.postMessage(callMessage)
    })
  }
}
```

## デモ

https://ksk1015.github.io/webworker-in-typescript/
