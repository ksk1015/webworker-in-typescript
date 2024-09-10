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
