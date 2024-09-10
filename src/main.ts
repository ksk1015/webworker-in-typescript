// workerTaskCreator を使ってのやつ

import Worker from './worker?worker'
import { getHelloTaskCaller } from './helloTask'
import { getAddingTaskCaller } from './addingTask'
import { getWaitingTaskCaller } from './waitingTask'
import { getFetchJsonTaskCaller } from './fetchJsonTask'

const worker = new Worker()

const callHelloTask = getHelloTaskCaller(worker)
const callAddingTask = getAddingTaskCaller(worker)
const callWaitingTask = getWaitingTaskCaller(worker)
const callFetchJsonTask = getFetchJsonTaskCaller(worker)

const showLog = (name: string, callTask: Promise<unknown>) => {
  const p = document.createElement('p')
  p.textContent = `${name} => `
  const text = document.createTextNode('...')
  p.appendChild(text)
  document.getElementById('app')?.appendChild(p)

  callTask.then((result) => {
    console.log(`${name} => `, result)
    text.textContent = JSON.stringify(result)
  })
}

showLog(`callHelloTask()`, callHelloTask())
showLog(`callAddingTask([1, 2]`, callAddingTask([1, 2]))
showLog(`callWaitingTask(2000)`, callWaitingTask(2000))

// 本番環境がルートじゃないことからpublicディレクトリへのパスがむずい
showLog(
  `callFetchJsonTask('./dummy.json')`,
  callFetchJsonTask(import.meta.env.PROD ? '../dummy.json' : '/dummy.json')
)

// ライブラリ使わないやつ

import NiceTaskWoker from './niceTaskWorker?worker'
import { getNiceTaskCaller } from './niceTask'

const niceTaskWorker = new NiceTaskWoker()
const callNiceTask = getNiceTaskCaller(niceTaskWorker)
showLog(
  `callNiceTask({name: 'Taro', age: 20})`,
  callNiceTask({ name: 'Taro', age: 20 })
)
