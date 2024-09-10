import { workerTaskCreator } from './workerTaskCreator'

const wait = (time: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

// 時間のかかる処理
const waitingTask = async (time: number = 1000) => {
  await wait(time)
  return `I'm waiting for ${time}ms`
}

export const {
  registerTask: registerWaitingTask,
  getTaskCaller: getWaitingTaskCaller,
} = workerTaskCreator('waiting', waitingTask)
