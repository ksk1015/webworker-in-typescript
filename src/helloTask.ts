import { workerTaskCreator } from './workerTaskCreator'

const hello = () => {
  return 'Hello from worker!'
}

// 引数のないtaskの場合はジェネリクスのTをvoidにする
export const {
  registerTask: registerHelloTask,
  getTaskCaller: getHelloTaskCaller,
} = workerTaskCreator<void, string>('hello', hello)
