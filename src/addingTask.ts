import { workerTaskCreator } from './workerTaskCreator'

const adding = ([a, b]: [number, number]) => {
  return a + b
}

export const {
  registerTask: registerAddingTask,
  getTaskCaller: getAddingTaskCaller,
} = workerTaskCreator('adding', adding)
